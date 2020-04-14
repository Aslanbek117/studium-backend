import {Get, Post, Body, Put, Delete, Query, Param, Controller} from '@nestjs/common';
import { Request } from 'express';
import { SolverService } from './solver.service';
import { CreateSolverDTO } from './dto';
import { User } from '../user/user.decorator';
import { FrontResponseDTO } from './solver.entity';

// @ApiBearerAuth()
@Controller('solution')
export class SolverController {

  constructor(private readonly solverService: SolverService) {}

  @Post('test')
  async test(@Body('test') testDTO: CreateSolverDTO): Promise<FrontResponseDTO> {
    return await this.solverService.doodle(testDTO);
  }

  @Post("/comment/mentor")
  async addComment(@Body('comment') comment: string, @Body('user_id') user_id: string, @Body("author_id") author_id: string, @Body('tutorial_id') tutorial_id: string, @Body('created_at') createdAt: string) {
    return await this.solverService.createComment(user_id, tutorial_id, author_id, comment, createdAt);
  }

  @Post("grade/teacher")
  async grade(@Body('comment') comment: string, @Body('user_id') user_id: string, @Body("author_id") author_id: string, @Body('tutorial_id') tutorial_id: string, @Body('created_at') createdAt: string) {
    return await this.solverService.createTeacherComment(user_id, tutorial_id, author_id,comment,  createdAt);
  }

}