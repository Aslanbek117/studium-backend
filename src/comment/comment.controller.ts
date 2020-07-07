import {Get, Post, Body, Put, Delete, Query, Param, Controller} from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment } from './comment.entity';
import { CreateCommentDTO } from './dto/create-comment';
import { UpdateCommentDTO } from './dto/update-comment';
@Controller('comment')
export class CommentController {

  constructor(private readonly commentService: CommentService) {}



  @Get('/all')
  async findAll(@Query() query): Promise<Comment[]> {
    console.log("ALL COMMENT")
    return await this.commentService.findAll();
  }



  @Post("create")
  async create(@Body('comment') commentDTO: CreateCommentDTO) {
    return this.commentService.create(commentDTO);
  }

  @Post('update')
  async update(@Body('comment') updateCommentDTO: UpdateCommentDTO) {
    // Todo: update slug also when title gets changed
    return this.commentService.updateComment(updateCommentDTO);
  }

  @Post('delete')
  async delete(@Param() params) {
    return this.commentService.delete(params.slug);
  }
}