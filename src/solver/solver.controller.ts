import {Get, Post, Body, Put, Delete, Query, Param, Controller} from '@nestjs/common';
import { Request } from 'express';
import { SolverService } from './solver.service';
import { CreateSolverDTO } from './dto';
import { User } from '../user/user.decorator';

// @ApiBearerAuth()
@Controller('solution')
export class SolverController {

  constructor(private readonly solverService: SolverService) {}

  @Post('test')
  async test(@Body('test') testDTO: CreateSolverDTO): Promise<any> {
    return await this.solverService.doodle(testDTO);
  }

}