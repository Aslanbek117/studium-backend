import { Module } from '@nestjs/common';
import { CourseGateway } from './course.gateway';
import { ChapterModule } from 'src/chapter/chapter.module';
import { ChapterService } from 'src/chapter/chapter.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChapterEntity } from 'src/chapter/chapter.entity';
import { CourseEntity } from 'src/course/course.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ChapterEntity, CourseEntity])],
    providers: [ CourseGateway ]
})
export class CourseSocketModule {}