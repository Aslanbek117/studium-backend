import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ChapterController } from './chapter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from '../course/course.entity';
import { UserEntity } from '../user/user.entity';
import { AuthMiddleware } from '../user/auth.middleware';
import { UserModule } from '../user/user.module';
import { ChapterService } from './chapter.service';
import { ChapterEntity } from './chapter.entity';
import { CourseModule } from '../course/course.module';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity, ChapterEntity, UserEntity]), CourseModule, UserModule],
  providers: [ChapterService],
  controllers: [
    ChapterController
  ],
  exports: [ChapterService]
})
export class ChapterModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        {path: 'chapter/all', method: RequestMethod.GET},
        {path: 'chapter/:tId', method: RequestMethod.GET},
        {path: 'chapter/create', method: RequestMethod.POST});
  }
}
