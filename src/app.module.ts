import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModule } from './course/course.module';
import { UserModule } from './user/user.module';
import { SolverModule } from './solver/solver.module';
import { ChapterModule } from './chapter/chapter.module';
import { TutorialModule } from './tutorial/tutorial.module';
const join = require("path");

@Module({
  imports: [    TypeOrmModule.forRoot({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "aslan",
    password: "",
    database: "aslan",
    entities: [join.join(__dirname, '**', `*.entity.{ts,js}`)],
    synchronize: true
  }),
  CourseModule,
    UserModule,
    SolverModule,
    ChapterModule,
    TutorialModule
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
