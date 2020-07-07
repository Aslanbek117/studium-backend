import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TutorialController } from './tutorial.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from '../course/course.entity';
import { UserEntity } from '../user/user.entity';
import { AuthMiddleware } from '../user/auth.middleware';
import { UserModule } from '../user/user.module';
import { TutorialService } from './tutorial.service';
import { TutorialEntity } from './tutorial.entity';
import { CourseModule } from '../course/course.module';
import { ChapterEntity } from '../chapter/chapter.entity';
import { UserToTutorials } from 'src/user/user-tutorials.entity';


@Module({
  imports: [TypeOrmModule.forFeature([ChapterEntity, UserEntity, TutorialEntity, UserToTutorials, CourseEntity, UserToTutorials]), UserModule, CourseModule],
  providers: [TutorialService],
  controllers: [
    TutorialController
  ]
})
export class TutorialModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)

        
  }
}
