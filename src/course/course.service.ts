import { Injectable, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult, QueryBuilder, In } from 'typeorm';
import { CourseEntity } from './course.entity';
import { Comment } from './comment.entity';
import { UserEntity } from '../user/user.entity';
import { CreateCourseDto, DeleteCourseDto } from './dto';

import {CourseRO, CoursesRO, CommentsRO, NewUserEntity, CoursesWithStudentsDTO, MonitoringCourseEntity, TutorialAndCompleted, UserWithCourses} from './course.interface';
import { cursorTo } from 'readline';
import { CourseModule } from './course.module';
import { statSync } from 'fs';
import { SampleUser } from './SampleUser.entity';
import { SamplePost } from './SamplePost.entity';
import { TutorialEntity } from 'src/tutorial/tutorial.entity';
import { UserToTutorials } from 'src/user/user-tutorials.entity';
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
    @InjectRepository(SamplePost)
    private readonly samplePostRepository: Repository<SamplePost>,
    @InjectRepository(SampleUser)
    private readonly sampleUserRepository: Repository<SampleUser>,
    @InjectRepository(UserToTutorials)
    private readonly userToTutorials: Repository<UserToTutorials>
  ) {}




    async findSampleUsers(): Promise<SampleUser[]> {

      const users = await this.userRepository.find();

      users.map(async u => {
        const tt = await this.userToTutorials.findOne({where: {userId: u.id}});
        tt.email = u.email;
        tt.lastname = u.lastname;
        tt.username = u.username;
        tt.course = u.course;
        await this.userToTutorials.save(tt);
      })






      return this.sampleUserRepository.find({relations: ["posts"]});
    }

    async findSamplePosts(): Promise<SamplePost[]> {
      return this.samplePostRepository.find({relations: ['users']});
    }

    async createSampleUser(name: string, postId?: string): Promise<SampleUser> {
      const samplePost = await this.samplePostRepository.findOne({where: {id: postId}});

      let sampleUser = new SampleUser();
      sampleUser.name = name;
      if (postId != undefined ) {
        sampleUser.posts.push(samplePost);
      }
      

      return this.sampleUserRepository.save(sampleUser);
    }

    async addUserToPost(userId: string, postId: string): Promise<SamplePost> {
      const post = await this.samplePostRepository.findOne({where: {id:postId}, relations: ['users']});
      const user = await this.sampleUserRepository.findOne({where: {id: userId}, relations: ['posts']});
      if (post.users == undefined) {
        post.users = [user];
      } else {
        post.users.push(user);
      }
      return this.samplePostRepository.save(post);

    }

    
    async createSamplePost(name: string, user_id?: string): Promise<SamplePost> {
      const sampleUser = await this.sampleUserRepository.findOne({where: { id: user_id}});

      let samplePost = new SamplePost();
      samplePost.name = name;
      if (user_id != undefined) {
        if (samplePost.users == undefined) {
          samplePost.users = [sampleUser];
        } else {
          samplePost.users.push(sampleUser);
        }
      }

      return this.samplePostRepository.save(samplePost);
    }




  async findAll(query): Promise<UserWithCourses> {

    const courses = await this.courseRepository.find({relations: ['students', 'chapters', 'chapters.tutorials']});
    let userIds: string[] = [];

    courses.map(c => c.students.map(st => userIds.push(st.id.toString())));
    const users = await this.userToTutorials.findByIds(userIds, {relations: ['user', 'tutorial']});
    const zz = await this.userToTutorials.find({where: {userId: In(userIds)}, relations: ['user']});

    const ss = await this.userRepository.find({where: {id: In(userIds)}, relations: ['userToTutorials']});
    const res: UserWithCourses = {
      courses: courses,
      users: ss
    }

    return res;
  }

  async addToCourse(user_id: string, course_id: string, is_delete?: boolean): Promise<String> {
    
   const user = await this.userRepository.findOne({where: { id: user_id}, relations: ['courses']});

   const course = await this.courseRepository.findOne({where: {id: course_id}, relations: ['students', 'chapters', 'chapters.tutorials']});

   if (course.students == undefined) {
     course.students = [user];
   } else if (course.students.length > 0){
     course.students.push(user);
   }

   if (is_delete != undefined && is_delete == true) {
     let students: UserEntity[] = [];
     course.students.map(st => {
       if (st.id .toString() != user_id) {
          students.push(st);
       }
     });

     course.students = students;
   }

   let tutorials: TutorialEntity[] = [];
   course.chapters.map(ch => {
     ch.tutorials.map( t => {
        tutorials.push(t);
     })
   })

  console.log("LENGTH", tutorials.length);


  if (is_delete != undefined && is_delete == true) {
    course.chapters.map(ch => {
      ch.tutorials.map( async t => {
        const find = await this.userToTutorials.findOne({where: {userId : user_id, tutorialId: t.id}});
        await this.userToTutorials.remove(find);
      })
    })
  }
   

   tutorials.map( async t => {
    const userT = await this.userToTutorials.findOne({where: {userId: user_id, tutorialId: t.id}, relations: ['user', 'tutorial']})
    if (userT == undefined) {
      const tt = new UserToTutorials();
      tt.userId = parseInt(user_id);
      tt.tutorialId = parseInt(t.id)
      tt.tutorial = t;
      tt.user = user;
      await this.userToTutorials.save(tt);
    }
   })
   

   await this.userRepository.save(user);


   await this.courseRepository.save(course);
   
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
