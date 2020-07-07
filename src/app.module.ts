import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModule } from './course/course.module';
import { UserModule } from './user/user.module';
import { SolverModule } from './solver/solver.module';
import { ChapterModule } from './chapter/chapter.module';
import { TutorialModule } from './tutorial/tutorial.module';
const join = require("path");
import { ScheduleModule } from '@nestjs/schedule';
import { CourseSocketModule } from './sockets/course/course.module';
import { CommentModule } from './comment/comment.module';
import { TopicModule } from './topic/topic.module';

@Module({
  imports: [    TypeOrmModule.forRoot({
    type: "postgres",
    // host: "ec2-54-75-231-215.eu-west-1.compute.amazonaws.com",
    host:"localhost",
    port: 5432,
    // username: "mkdwfqcqvcjijs",
    username: "aslan",
    // password: "3ff4992b4a14e1ef87314f44c13157fc1539170e04738a85929cb22c2de27c12",
    password:"",
    // database: "d6mkjpk3onbgtk",
    database:"aslan",
    entities: [join.join(__dirname, '**', `*.entity.{ts,js}`)],
    synchronize: true
  }),
  ScheduleModule.forRoot(),
  HttpModule,
  CourseModule,
    UserModule,
    SolverModule,
    ChapterModule,
    TutorialModule,
    CourseSocketModule,
    TopicModule,
    CommentModule
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
