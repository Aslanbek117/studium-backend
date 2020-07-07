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
import { CourseEntity } from 'src/course/course.entity';

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
    private readonly userToTutorialsRepository: Repository<UserToTutorials>,
    @InjectRepository(CourseEntity)
    private readonly courseRepostitory: Repository<CourseEntity>,
    @InjectRepository(UserToTutorials)
    private readonly userToTutorials: Repository<UserToTutorials>
  ) {}
  async findAll(): Promise<TutorialEntity[]> {

    return this.tutorialRepository.find({relations: ['chapter']});
  }

  async findOne({title}): Promise<TutorialEntity> {
    const tutorial = this.tutorialRepository.findOne({where: {title: title}, relations: ['chapter']});
    return tutorial;
  }

  async addTutorialToChapter(aId: string, tId: string): Promise<TutorialEntity> {
    const chapter = await this.chapterRepository.findOne({where: {id: aId}, relations: ['tutorials']});
    const tutorial = await this.tutorialRepository.findOne({where: {id: tId}, relations: ['chapter']});
    chapter.tutorials = [tutorial];
    const saved = await this.chapterRepository.save(chapter);
    return tutorial;

  }

  async findAllByChapterId({chapterId}): Promise<TutorialEntity[]> {
    return this.tutorialRepository.find({where: {chapter: {id: chapterId}}, relations: ['chapter']})
  }

  async updateDescription(description: string, tId: string, exampleCode: string): Promise<TutorialEntity> {
    const t = await this.tutorialRepository.findOne({where: { id: tId}});
    t.body = description;
    t.exampleCode = exampleCode;
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

    return "ok";
  }

  async create(data: CreateTutorialDTO): Promise<TutorialEntity> {
    
    let tutorial = new TutorialEntity();
    tutorial.title = data.title;
    tutorial.body = data.body;
    tutorial.input = data.input;
    tutorial.output = data.output;
    tutorial.isLecture = data.isLecture;
    tutorial.exampleCode = data.exampleCode;
    const user = await this.userRepository.findOne({where: {id: data.userId}});
    tutorial.author = user;
    const chapter = await this.chapterRepository.findOne({where: {id: data.chapterId}, relations: ['course', 'course.students', 'course.students.userToTutorials']});
    tutorial.chapter = chapter;
    chapter.course.students
    const savedTutorial = await this.tutorialRepository.save(tutorial);

    chapter.course.students.map(async st => {
      let found = st.userToTutorials.find(ust => ust.tutorialId.toString() == savedTutorial.id.toString())
      console.log("FOUD", found);
      if (found == undefined) {
        const tt = new UserToTutorials();
      tt.userId = st.id;
      tt.tutorialId = parseInt(savedTutorial.id)
      tt.tutorial = savedTutorial;
      tt.user = st;
      const saved = await this.userToTutorials.save(tt);
      console.log("save", saved)
      }
    })

    return savedTutorial;
  }

}
