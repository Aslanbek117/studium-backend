import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from './course.entity';
import { Comment } from './comment.entity';
import { UserEntity } from '../user/user.entity';
import { CourseService } from './course.service';
import { AuthMiddleware } from '../user/auth.middleware';
import { UserModule } from '../user/user.module';
import { SamplePost } from './SamplePost.entity';
import { SampleUser } from './SampleUser.entity';
import { UserToTutorials } from 'src/user/user-tutorials.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity, Comment, UserEntity, SamplePost, SampleUser, UserToTutorials]), UserModule],
  providers: [CourseService],
  controllers: [
    CourseController
  ]
})
export class CourseModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        {path: 'course/create', method: RequestMethod.POST})
  }
}
