import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult } from 'typeorm';
import { CourseEntity } from '../course/course.entity';
import { UserEntity } from '../user/user.entity';
import { ChapterEntity } from './chapter.entity';
import { CreateChapterDTO } from './dto';
import { ChapterModule } from './chapter.module';

const slug = require('slug');

@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(ChapterEntity)
    private readonly chapterRepository: Repository<ChapterEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async findAll(): Promise<ChapterEntity[]> {

    return this.chapterRepository.find({relations: ['course', 'tutorials']});
  }

  async findOne({tId}): Promise<ChapterEntity> {
    const chapter = this.chapterRepository.findOne({where: {id: tId}, relations: ['course', 'tutorials']});
    return chapter;
  }

  async addChapterToCourse(courseId: string, chapterId: string): Promise<ChapterEntity> {
    const course = await this.courseRepository.findOne({where: {id: courseId}, relations: ['chapters']});
    const chapter = await this.chapterRepository.findOne({where: {id: chapterId}, relations: ['course', 'tutorials']});
    // article.chapters = [chapter];
    if (course.chapters.length == 0) {
      course.chapters = [chapter];
    } else if (course.chapters.length > 0) {
      course.chapters.push(chapter);
    }

    const saved = await this.courseRepository.save(course);
    return chapter;

  }

  async findAllByArticleId({articleId}): Promise<ChapterEntity[]> {
    return this.chapterRepository.find({where: {article: {id: articleId}}, relations: ['course', 'tutorials']})
  }

  async updateDescription(description: string, tId: string): Promise<ChapterEntity> {
    const t = await this.chapterRepository.findOne({where: { id: tId}});
    t.body = description;
    return this.chapterRepository.save(t);
  }

  async create(chapterData: CreateChapterDTO): Promise<ChapterEntity> {
    console.log("create chapter reqeust", chapterData)
    let chapter = new ChapterEntity();
    chapter.title = chapterData.title;
    chapter.body = chapterData.body;
    const user = await this.userRepository.findOne({where: {id: chapterData.userId}})
    console.log("user", user)
    chapter.author = user;
    const course = await this.courseRepository.findOne({where: {id: chapterData.courseId}});
    chapter.course = course;
    const savedChapter = this.chapterRepository.save(chapter);
    return savedChapter;
  }

}
