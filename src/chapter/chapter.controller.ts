import {Get, Post, Body, Put, Delete, Query, Param, Controller} from '@nestjs/common';
import { Request } from 'express';
import { ChapterService } from './chapter.service';
import { CreateChapterDTO } from './dto';
import { User } from '../user/user.decorator';
import { ChapterEntity } from './chapter.entity';
import { UserEntity } from '../user/user.entity';
@Controller('chapters')
export class ChapterController {

  constructor(private readonly chapterService: ChapterService) {}

  @Get('/all')
  async findAll(): Promise<ChapterEntity[]> {
    return await this.chapterService.findAll();
  }

  @Get(':id')
  async byId(@Param() chapterId): Promise<ChapterEntity> {
    return await this.chapterService.findOne(chapterId);
  }


  @Post('create')
  async create(@Body('chapter') chapterDAO: CreateChapterDTO): Promise<ChapterEntity> {
    return this.chapterService.create(chapterDAO);
  }


  @Post('update')
  async update(@Body('chapterId') chapterId: string, @Body('description') description: string) {
    return this.chapterService.updateDescription(description, chapterId);
  }

  @Post('addToCourse')
  async addToCourse(@Body('chapterId') chapterId: string, @Body('courseId') courseId: string) {
    return this.chapterService.addChapterToCourse(courseId, chapterId);
  }


}