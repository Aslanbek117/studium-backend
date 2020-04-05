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
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ChapterEntity)
    private readonly chapterRepository: Repository<ChapterEntity>,
  ) {}
  async findAll(): Promise<ChapterEntity[]> {

    return this.chapterRepository.find({relations: ['course', 'tutorials']});
  }

  async findOne({tId}): Promise<ChapterEntity> {
    console.log("chapterId", tId);
    const chapter = this.chapterRepository.findOne({where: {id: tId}, relations: ['course', 'tutorials']});
    return chapter;
  }

  async addChapterToCourse(courseId: string, chapterId: string): Promise<ChapterEntity> {
    console.log("Adding");
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

  async create(userId: string, courseName: string, chapterTitle: string, chapterBody: string): Promise<ChapterEntity> {
    let chapter = new ChapterEntity();
    chapter.title = chapterTitle;
    chapter.body = chapterBody;
    const user = await this.userRepository.findOne({where: {id: userId}});
    chapter.author = user;
    const course = await this.courseRepository.findOne({where: {title: courseName}});
    chapter.course = course;
    const savedChapter = this.chapterRepository.save(chapter);
    return savedChapter;
  }

}
