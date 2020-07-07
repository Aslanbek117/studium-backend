import {Get, Post, Body, Put, Delete, Query, Param, Controller} from '@nestjs/common';
import { TopicService } from './topic.service';
import { Topic } from './topic.entity';
import { CreateTopicDTO } from './dto/create-topic';
import { UpdateTopicDTO } from './dto/update-topic';
@Controller('topic')
export class TopicController {

  constructor(private readonly topicService: TopicService) {}



  @Get('/all')
  async findAll(@Query() query): Promise<Topic[]> {
    return await this.topicService.findAll();
  }

  @Get("/course/:courseTitle")
  async getByCourseId(@Param() param): Promise<Topic[]> {
    return await this.topicService.findAllByCourseTitle(param);
  }

  @Get("/:topicId")
  async findOne(@Param() param): Promise<Topic> {
    return await this.topicService.findBytopicId(param);
  }


  @Post("create")
  async create(@Body('topic') topicDTO: CreateTopicDTO) {
    return this.topicService.create(topicDTO);
  }

  @Post('update')
  async update(@Body('comment') updateTopicDTO: UpdateTopicDTO) {
    // Todo: update slug also when title gets changed
    return this.topicService.updateTopic(updateTopicDTO);
  }

  @Post('delete')
  async delete(@Body("topicId") topicId: string) {
    return this.topicService.delete(topicId);
  }
}