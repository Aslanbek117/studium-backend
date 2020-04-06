import {Get, Post, Body, Put, Delete, Query, Param, Controller} from '@nestjs/common';
import { Request } from 'express';
import { TutorialService } from './tutorial.service';
import { CreateTutorialDTO } from './dto';
import { User } from '../user/user.decorator';
import { TutorialEntity } from './tutorial.entity';
import { UserEntity } from '../user/user.entity';
import { ChangeStream } from 'typeorm';

@Controller('tutorial')
export class TutorialController {

  constructor(private readonly tutorialService: TutorialService) {}

  @Get('/tutorials/all')
  async findAll(): Promise<TutorialEntity[]> {
    console.log("DADSA");
    return await this.tutorialService.findAll();
  }

  @Get(':title')
  async byId(@Param() title): Promise<TutorialEntity> {
    return await this.tutorialService.findOne(title);
  }


  @Post('create')
  async create(@Body('userId') userId: string, @Body('chapterName') chapterName: string, @Body('tutorial') tutorialData: CreateTutorialDTO) {
    console.log("create tutorial", tutorialData.title);
    return this.tutorialService.create(userId, chapterName, tutorialData.title, tutorialData.body, tutorialData.input, tutorialData.output, tutorialData.isLecture);
  }

  @Post('completed')
  async complete(@Body('userId') user_id: string, @Body('tutorialId') tutorial_id: string, @Body("chapterId") chapter_id: string) {
    return await this.tutorialService.markRead(user_id, tutorial_id, chapter_id);
  }










  @Post('update')
  async update(@Body('tutorialId') tutorialId: string, @Body('description') description: string) {
    console.log("iupdate desc", tutorialId, description);
    return this.tutorialService.updateDescription(description, tutorialId);
  }

  @Post('addToCourse')
  async addToCourse(@Body('tutorialId') tutorialId: string, @Body('articleId') articleId: string) {
    return this.tutorialService.addTutorialToChapter(articleId, tutorialId);
  }

  
  @Post('io')
  async addOI(@Body('tutorialId') tutorialId: string, @Body('input') input: string[], @Body('output') output: string[]) {
    console.log("iupdate desc", tutorialId, input, output);
    return this.tutorialService.addIO(input, output, tutorialId);
  }

}