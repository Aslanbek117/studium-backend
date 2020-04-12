import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult } from 'typeorm';
import { ChapterEntity } from '../chapter/chapter.entity';
import { UserEntity } from '../user/user.entity';
import { TutorialEntity } from './tutorial.entity';
import { CreateTutorialDTO } from './dto';
import { TutorialModule } from './tutorial.module';
import { getHeapStatistics } from 'v8';
import { timer } from 'rxjs';
import { UserToTutorials } from 'src/user/user-tutorials.entity';

const slug = require('slug');

@Injectable()
export class TutorialService {
  constructor(
    @InjectRepository(ChapterEntity)
    private readonly chapterRepository: Repository<ChapterEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(TutorialEntity)
    private readonly tutorialRepository: Repository<TutorialEntity>,
    @InjectRepository(UserToTutorials)
    private readonly userToTutorialsRepository: Repository<UserToTutorials>
  ) {}
  async findAll(): Promise<TutorialEntity[]> {

    return this.tutorialRepository.find({relations: ['chapter']});
  }

  async findOne({title}): Promise<TutorialEntity> {
    const tutorial = this.tutorialRepository.findOne({where: {title: title}, relations: ['chapter']});
    return tutorial;
  }

  async addTutorialToChapter(aId: string, tId: string): Promise<TutorialEntity> {
    console.log("Adding");
    const chapter = await this.chapterRepository.findOne({where: {id: aId}, relations: ['tutorials']});
    const tutorial = await this.tutorialRepository.findOne({where: {id: tId}, relations: ['chapter']});
    chapter.tutorials = [tutorial];
    const saved = await this.chapterRepository.save(chapter);
    return tutorial;

  }

  async findAllByChapterId({chapterId}): Promise<TutorialEntity[]> {
    return this.tutorialRepository.find({where: {chapter: {id: chapterId}}, relations: ['chapter']})
  }

  async updateDescription(description: string, tId: string): Promise<TutorialEntity> {
    const t = await this.tutorialRepository.findOne({where: { id: tId}});
    t.body = description;
    return this.tutorialRepository.save(t);
  }

  async addIO(input: string[], output: string[], tId: string): Promise<TutorialEntity> {
    const t = await this.tutorialRepository.findOne({where: { id: tId}});
    t.input = input;
    t.output = output;
    return this.tutorialRepository.save(t);
  }

  async markRead(user_id: string, tutorial_id: string, chapter_id: string): Promise<String> {
    const userToTutorials = await this.userToTutorialsRepository.findOne({where: {userId: user_id, tutorialId: tutorial_id}, relations: ['user', 'tutorial']});
    userToTutorials.isViewed = true;
    userToTutorials.view_date = new Date();

    await this.userToTutorialsRepository.save(userToTutorials);

    console.log("usert", userToTutorials);

    return "ok";
  }

  async create(userId: string, chapterName: string, tutorialTitle: string, tutorialBody: string, tutorialInput: string[], tutorialOutput: string[], isLecture: boolean): Promise<TutorialEntity> {
    
    let tutorial = new TutorialEntity();
    tutorial.title = tutorialTitle;
    tutorial.body = tutorialBody;
    tutorial.input = tutorialInput;
    tutorial.output = tutorialOutput;
    tutorial.isLecture = isLecture;
    tutorial.author = null;
    const chapter = await this.chapterRepository.findOne({where: {title: chapterName}});
    tutorial.chapter = chapter;
    const savedTutorial = this.tutorialRepository.save(tutorial);
    return savedTutorial;
  }

}
