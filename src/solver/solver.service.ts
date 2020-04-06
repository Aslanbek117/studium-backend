import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult, In } from 'typeorm';
import { SolverEntity } from './solver.entity';
import { CreateSolverDTO } from './dto';
import { CourseEntity } from '../course/course.entity';
import { create } from 'domain';
import { TutorialEntity } from '../tutorial/tutorial.entity';
import { UserEntity } from '../user/user.entity';
var fs = require('fs');

const { c, cpp, node, python, java } = require('compile-run');

@Injectable()
export class SolverService {
  constructor(
    @InjectRepository(SolverEntity)
    private readonly  solverRepo: Repository<SolverEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,
    @InjectRepository(TutorialEntity)
    private readonly tutorialRepo: Repository<TutorialEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>
  ) {}

  async findAll(body: CreateSolverDTO): Promise<SolverEntity> {
    const user = await this.userRepo.findOne({where: { id: body.userId}});
    const tutorial = await this.tutorialRepo.findOne({where: { id: body.tutorialId}})
    const fileName: string = user.email + "-" + tutorial.id + ".c";
    fs.writeFile(
      __dirname +"/" +fileName,
       body.userCode
    , function (err) {
      if (err) throw err;
    });
    console.log("fileName", fileName)

    console.log("to exec", __dirname + fileName);
    const compile_result = await this.compile_run(body.userId, body.tutorialId,  fileName, tutorial.input, tutorial.output);
    return compile_result;
  }


  async compile_run(user_id: string, tutorial_id: string, fileName: string, input: string[], output: string[]): Promise<SolverEntity> {

    const length = input.length;
    const start = Date.now();
    let i = 0 ;
    let res = [];
    let stdouts: string[] = [];
    let stderrs: string[] = [];
    for (i = 0 ; i< input.length; i++) {
      const start = Date.now();
      const result: Promise<any> = c.runFile(__dirname + "/" + fileName, { stdin: input[i] });
      const ss = await result;
      stdouts.push(ss.stdout);
      stderrs.push(ss.stderr);
    }


    let j = 0 ;

    let decisions: boolean[] = [];

    for (j = 0 ; j < output.length; j++) {
      if (stdouts[j] != output[j]) {
        decisions.push(false);
      }
      else {
        decisions.push(true);
      }
    }

    const createdTask = await this.solverRepo.create({
      stdout: stdouts,
      stderr: stderrs,
      input: input,
      output: output,
      decisions: decisions
    });

    let isSolved = true;

    decisions.map(d => {
      if (d == false) {
        isSolved = false;
      }
    })

    if (isSolved) {
      const user = await this.userRepo.findOne({where: {id: user_id}, relations: ['courses', 'courses.chapters', 'courses.chapters.tutorials']});
      const tutorial = await this.tutorialRepo.findOne({where: { user: {id: user_id}, id: tutorial_id}});
      tutorial.isCompleted = true;
      const savedTutorial = await this.tutorialRepo.save(tutorial);
    }

    const saved =  this.solverRepo.save(createdTask);
    return saved;

  }

}
