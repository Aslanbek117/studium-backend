import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from './course.entity';
import { Comment } from './comment.entity';
import { UserEntity } from '../user/user.entity';
import { CourseService } from './course.service';
import { AuthMiddleware } from '../user/auth.middleware';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity, Comment, UserEntity]), UserModule],
  providers: [CourseService],
  controllers: [
    CourseController
  ]
})
export class CourseModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // throw new Error("Method not implemented.");
    console.log("d");
  }
  // public configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(AuthMiddleware)
  //     .forRoutes(
  //       {path: 'courses', method: RequestMethod.POST},
  //       {path: 'courses/delete', method: RequestMethod.POST},
  //       {path: 'courses/zaebal', method: RequestMethod.GET},
  //       {path: 'courses/course/:id', method: RequestMethod.GET},
  //       {path: 'courses/:title', method: RequestMethod.GET},
  //       {path: 'courses/:slug', method: RequestMethod.PUT},
  //       {path: 'courses/:slug/comments', method: RequestMethod.POST},
  //       {path: 'courses/:slug/comments/:id', method: RequestMethod.DELETE},
  //       {path: 'courses/:slug/favorite', method: RequestMethod.POST},
  //       {path: 'courses/:slug/favorite', method: RequestMethod.DELETE});
  // }
}
