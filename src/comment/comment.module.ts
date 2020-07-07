import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { AuthMiddleware } from '../user/auth.middleware';
import { UserModule } from '../user/user.module';
import { UserToTutorials } from 'src/user/user-tutorials.entity';
import { TutorialEntity } from 'src/tutorial/tutorial.entity';
import { Comment } from './comment.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CourseEntity } from 'src/course/course.entity';
import { Topic } from '../topic/topic.entity';
@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity, Comment, UserEntity, Topic])],
  providers: [CommentService],
  controllers: [
    CommentController
  ]
})
export class CommentModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      
  }
}
