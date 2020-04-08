import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult, QueryBuilder } from 'typeorm';
import { CourseEntity } from './course.entity';
import { Comment } from './comment.entity';
import { UserEntity } from '../user/user.entity';
import { CreateCourseDto, DeleteCourseDto } from './dto';

import {CourseRO, CoursesRO, CommentsRO, NewUserEntity, CoursesWithStudentsDTO, MonitoringCourseEntity, TutorialAndCompleted} from './course.interface';
import { cursorTo } from 'readline';
import { CourseModule } from './course.module';
import { statSync } from 'fs';
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

  async findAll(query): Promise<CoursesWithStudentsDTO> {

    const users = await this.userRepository.find({relations: ['courses', 'courses.chapters', 'courses.chapters.tutorials']});

    const courses = await this.courseRepository.find({relations: ['chapters', 'chapters.tutorials', 'students', 'students.courses', 'students.courses.chapters', 'students.courses.chapters.tutorials']})

    let stc: UserEntity[] = [];

    let newUserEntity: NewUserEntity[] = [];

    users.map(u => {
       u.courses.map(c => {
        let tempUserEntity: NewUserEntity = {} as any;
        tempUserEntity.email = u.email;
        tempUserEntity.id = u.id.toString();
        tempUserEntity.lastname = u.lastname;
        tempUserEntity.username = u.username;
        c.chapters.map(ch => {
          ch.tutorials.map(t => {
            if (u.id == 36) {
              console.log("alex", u.username);
            }
              let status: TutorialAndCompleted = {
                tutorialId: t.id,
                isCompleted: t.isCompleted
              }

              if (u.id == 36) {
                console.log("status", status);
              }
              if (!tempUserEntity.tutorialStatus || tempUserEntity.tutorialStatus == undefined) {
                tempUserEntity.tutorialStatus = [status]
              } else {
                tempUserEntity.tutorialStatus.push(status);
              }
          })
        })
        newUserEntity.push(tempUserEntity);
      })
    })
    
   
    courses.map( c => {
      c.chapterCount = c.chapters.length.toString();
      let count = 0;
      c.chapters.map ( ch => {
        count += ch.tutorials.length;
      })
      c.tutorialCount = count.toString();
    })
    const coursesCount = courses.length
    
    let mce: MonitoringCourseEntity[] = [];



    
    courses.map( c => {
      let temp: MonitoringCourseEntity = {
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        body: c.body,
        card_description: c.card_description,
        course_overview: c.course_overview,
        img_url: c.img_url,
        created: c.created,
        updated: c.updated,
        chapters: c.chapters
      }
      if (mce == undefined) {
        mce = [temp]
      } else {
        mce.push(temp);
      }
    })

    const response: CoursesWithStudentsDTO =  {
      courses: mce,
      user: newUserEntity
    }
    return response;

  }

  async addToCourse(user_id: string, course_id: string, is_delete: boolean): Promise<String> {
    
    const user = await this.userRepository.findOne({ where: { id: user_id}, relations: ['courses']});

    const course = await this.courseRepository.findOne({where: { id: course_id}, relations: ['students']});

    let isUserInCourse = false;
    if (course.students &&  course.students.length == 0) {
      course.students = [user];
      user.courses = [course];
      await this.courseRepository.save(course);
      await this.userRepository.save(user);
    } else {
      course.students.map( user => {
        if (user.id.toString() == user_id) {
          isUserInCourse = true;
        } 
      })
    }

    if (!isUserInCourse) {
      course.students.push(user);
      user.courses.push(course);
      await this.courseRepository.save(course);
      await this.userRepository.save(user);
    }

    if (is_delete == true) {
      let courseS: CourseEntity[] = [];

      user.courses.map( c => {
        if (c.id != course_id) {
          if (courseS == undefined) {
            courseS = [c];
          } else {
            courseS.push(c);
          }
        }
      })
      if (user.courses == undefined || user.courses.length == 0) {
        user.courses = [];
      } else {
        user.courses = courseS;
      }
      
      await this.userRepository.save(user);
      let coursesT: UserEntity[] = [];
      course.students.map(st => {
        if (st.id != user.id)  {
          if (coursesT == undefined) {
            coursesT = [st];
          } else {
            coursesT.push(st);
          }
        }
      })

      if (course.students == undefined || course.students.length == 0) {
        course.students = [];
      } else {
        course.students = coursesT;
      }
    }


    const saved = await this.userRepository.save(user);
    return "OK";
  }


  async findById({id}): Promise<CourseRO> {
    const course = await this.courseRepository.findOne({where: { id: id}, relations: ['chapters', 'chapters.tutorials']});
    return {course};
  }

  async findOne({title}): Promise<CourseRO> {
    const course = await this.courseRepository.findOne({where: { title: title}, relations: ['chapters', 'chapters.tutorials', 'students', 'students.courses', 'students.courses.chapters', 'students.courses.chapters.tutorials']});
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
