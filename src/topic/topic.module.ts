import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { AuthMiddleware } from '../user/auth.middleware';
import { UserModule } from '../user/user.module';
import { UserToTutorials } from 'src/user/user-tutorials.entity';
import { TutorialEntity } from 'src/tutorial/tutorial.entity';
import { Topic } from './topic.entity';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';
import { CourseEntity } from 'src/course/course.entity';
@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity, Topic, UserEntity])],
  providers: [TopicService],
  controllers: [
    TopicController
  ]
})
export class TopicModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      
  }
}
