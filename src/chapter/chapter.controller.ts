import {Get, Post, Body, Put, Delete, Query, Param, Controller} from '@nestjs/common';
import { Request } from 'express';
import { ChapterService } from './chapter.service';
import { CreateChapterDTO } from './dto';
import { User } from '../user/user.decorator';
import { ChapterEntity } from './chapter.entity';
import { UserEntity } from '../user/user.entity';
@Controller('chapter')
export class ChapterController {

  constructor(private readonly chapterService: ChapterService) {}

  @Get('/chapters/all')
  async findAll(): Promise<ChapterEntity[]> {
    console.log("DADSA");
    return await this.chapterService.findAll();
  }

  @Get(':id')
  async byId(@Param() chapterId): Promise<ChapterEntity> {
    console.log("byId", chapterId);
    return await this.chapterService.findOne(chapterId);
  }


  @Post('create')
  async create(@Body('userId') userId: string, @Body('articleName') articleName: string, @Body('chapter') chapterData: CreateChapterDTO) {
    console.log("create chapter", chapterData.title);
    return this.chapterService.create(userId, articleName, chapterData.title, chapterData.body);
  }


  @Post('update')
  async update(@Body('chapterId') chapterId: string, @Body('description') description: string) {
    console.log("iupdate desc", chapterId, description);
    return this.chapterService.updateDescription(description, chapterId);
  }

  @Post('addToCourse')
  async addToCourse(@Body('chapterId') chapterId: string, @Body('courseId') courseId: string) {
    return this.chapterService.addChapterToCourse(courseId, chapterId);
  }


}