import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult, QueryBuilder } from 'typeorm';
import { CourseEntity } from './course.entity';
import { Comment } from './comment.entity';
import { UserEntity } from '../user/user.entity';
import { CreateCourseDto, DeleteCourseDto } from './dto';

import {CourseRO, CoursesRO, CommentsRO} from './course.interface';
import { cursorTo } from 'readline';
import { CourseModule } from './course.module';
const slug = require('slug');

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(query): Promise<CoursesRO> {

    const courses = await this.courseRepository.find({relations: ['chapters', 'chapters.tutorials']})
    courses.map( c => {
      c.chapterCount = c.chapters.length.toString();
      let count = 0;
      c.chapters.map ( ch => {
        count += ch.tutorials.length;
      })
      c.tutorialCount = count.toString();
    })
    const coursesCount = courses.length
    return {courses, coursesCount}

  }

  async addToCourse(user_id: string, course_id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id: user_id}, relations: ['courses']});

    const course = await this.courseRepository.findOne({where: { id: course_id}});

    let isPresent = false;
    user.courses.map( c => {
      if (c.id == course_id) {
        isPresent= true;
      }
    })

    let courses: CourseEntity[] = [];

    if (!isPresent) {
      if (user.courses.length == 0 ) {
        user.courses = [course];
      } else {
        user.courses.push(course);
      }
    } else {
      user.courses.map(c => {
        if (c.id != course_id) {
          courses.push(c);
        }
      })
      user.courses = courses;
    }

    
    
    const saved = await this.userRepository.save(user);
    return saved;
  }


  async findById({id}): Promise<CourseRO> {
    const course = await this.courseRepository.findOne({where: { id: id}, relations: ['chapters', 'chapters.tutorials']});
    return {course};
  }

  async findOne({title}): Promise<CourseRO> {
    const course = await this.courseRepository.findOne({where: { title: title}, relations: ['chapters', 'chapters.tutorials']});
    return {course};
  }

  async create(courseData: CreateCourseDto): Promise<CourseEntity> {

    let course = new CourseEntity();
    course.title = courseData.title;
    course.slug = this.slugify(courseData.title);
    course.tagList = courseData.tagList || [];
    course.course_overview = courseData.course_overview
    course.card_description = courseData.card_description
    course.img_url = courseData.img_url
    course.comments = [];

    const newCourse = await this.courseRepository.save(course);

    // const author = await this.userRepository.findOne({ where: { id: userId } });

    // if (Array.isArray(author.courses)) {
    //   author.courses.push(course);
    // } else {
    //   author.courses = [course];
    // }

    // await this.userRepository.save(author);

    return newCourse;

  }

  async update(slug: string, courseData: any): Promise<CourseRO> {
    let toUpdate = await this.courseRepository.findOne({ slug: slug});
    let updated = Object.assign(toUpdate, courseData);
    const course = await this.courseRepository.save(updated);
    return {course};
  }

  async delete(slug: string): Promise<DeleteResult> {
    return await this.courseRepository.delete({ slug: slug});
  }

  async deleteCourseById(course: DeleteCourseDto) {
    let deleted = await this.courseRepository.delete({id: course.courseId});
    return deleted.affected > 0 ? true : false;
  }

  slugify(title: string) {
    return slug(title, {lower: true}) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36)
  }
}
