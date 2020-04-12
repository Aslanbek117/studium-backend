import {Get, Post, Body, Put, Delete, Query, Param, Controller} from '@nestjs/common';
import { Request } from 'express';
import { CourseService } from './course.service';
import { CreateCourseDto, CreateCommentDto, DeleteCourseDto } from './dto';
import { CoursesRO, CourseRO, CoursesWithStudentsDTO, CreateSamplePostDTO, CreateSampleUserDTO, UserWithCourses } from './course.interface';
import { CommentsRO } from './course.interface';
import { User } from '../user/user.decorator';
import { CourseEntity } from './course.entity';
import { UserEntity } from '../user/user.entity';
import { SampleUser } from './SampleUser.entity';
import { SamplePost } from './SamplePost.entity';

@Controller('course')
export class CourseController {

  constructor(private readonly courseService: CourseService) {}


  @Get("/sample/users/all")
  async findAllSampleusers(): Promise<SampleUser[]> {
    return await this.courseService.findSampleUsers();
  }

  @Get("/sample/posts/all")
  async findAllSamplePosts(): Promise<SamplePost[]> {
    return await this.courseService.findSamplePosts();
  }


  @Post("/sample/post/create")
  async createSamplePost(@Body("post") samplePostDTO: CreateSamplePostDTO): Promise<SamplePost> {
    return await this.courseService.createSamplePost(samplePostDTO.name, samplePostDTO.userId);

  }

  @Post("/sample/user/create")
  async createSampleUser(@Body("user") sampleUserDTO: CreateSampleUserDTO): Promise<SampleUser> {
    return await this.courseService.createSampleUser(sampleUserDTO.name, sampleUserDTO.postId);
  }


  @Post('/sample/post/add')
  async z(@Body("userId") userId: string, @Body("postId") postId: string): Promise<SamplePost> {
    return await this.courseService.addUserToPost(userId, postId);
  }

  @Get('/all')
  async findAll(@Query() query): Promise<UserWithCourses> {
    return await this.courseService.findAll(query);
  }

  @Get('/id/:id')
  async findBYId(@Param() id): Promise<CourseRO> {
    console.log("Id")
    return await this.courseService.findById(id);
  }

  @Get('/title/:title')
  async findOne(@Param() title): Promise<CourseRO> {
    console.log("SLUGG", title);
    return await this.courseService.findOne(title);
  }

  @Post('delete')
  async deleteCourse(@Body("course") deleteCourseDto: DeleteCourseDto) {
    const result = await this.courseService.deleteCourseById(deleteCourseDto);
    const response = { isDeleted: result};
    return response;
  }

  @Post('/course/enroll')
  async enroll(@Body('user_id') user_id: string, @Body('course_id') course_id: string, @Body("is_delete") is_delete: boolean): Promise<CourseEntity> {
    console.log("ENROLL");
    const user = await this.courseService.addToCourse(user_id, course_id, is_delete);
    return user;
  }


  @Post("create")
  async create(@Body('course') courseData: CreateCourseDto) {
    console.log("create course");
    return this.courseService.create(courseData);
  }

  @Post('update')
  async update(@Param() params, @Body('course') courseData: CreateCourseDto) {
    // Todo: update slug also when title gets changed
    return this.courseService.update(params.slug, courseData);
  }

  @Post('delete')
  async delete(@Param() params) {
    return this.courseService.delete(params.slug);
  }
}