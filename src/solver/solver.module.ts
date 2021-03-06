import { MiddlewareConsumer, Module, NestModule, RequestMethod, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { AuthMiddleware } from '../user/auth.middleware';
import { UserModule } from '../user/user.module';
import { SolverController } from './solver.controller';
import { SolverEntity } from './solver.entity';
import { SolverService } from './solver.service'
import { CourseEntity } from '../course/course.entity';
import { TutorialEntity } from '../tutorial/tutorial.entity';
import { UserToTutorials } from 'src/user/user-tutorials.entity';


@Module({
  imports: [TypeOrmModule.forFeature([SolverEntity, UserEntity, CourseEntity, TutorialEntity, UserEntity, UserToTutorials]), UserModule, HttpModule],
  providers: [SolverService],
  controllers: [
    SolverController
  ]
})
export class SolverModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        {path: 'solvers', method: RequestMethod.POST},
        {path: 'solvers/solve', method: RequestMethod.POST},
        {path: 'solvers/feed', method: RequestMethod.GET});
  }
}
