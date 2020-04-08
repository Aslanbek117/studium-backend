import { Injectable, HttpService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult, In } from 'typeorm';
import { SolverEntity } from './solver.entity';
import { CreateSolverDTO, ResponseDTO } from './dto';
import { CourseEntity } from '../course/course.entity';
import { create } from 'domain';
import { TutorialEntity } from '../tutorial/tutorial.entity';
import { UserEntity } from '../user/user.entity';

var fs = require('fs');

const { c, cpp, node, python, java } = require('compile-run');
const DOODLE_URL = "https://api.jdoodle.com/v1/execute";



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
    private readonly userRepo: Repository<UserEntity>,
    private httpService: HttpService
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
    // const compile_result = await this.compile_run(body.userId, body.tutorialId,  fileName, tutorial.input, tutorial.output);
    // return compile_result;

    return {} as any;
  }
  

  // async compile_run(user_id: string, tutorial_id: string, fileName: string, input: string[], output: string[]): Promise<SolverEntity> {

  //   const length = input.length;
  //   const start = Date.now();
  //   let i = 0 ;
  //   let res = [];
  //   let stdouts: string[] = [];
  //   let stderrs: string[] = [];
  //   for (i = 0 ; i< input.length; i++) {
  //     const start = Date.now();
  //     const result: Promise<any> = c.runFile(__dirname + "/" + fileName, { stdin: input[i] });
  //     const ss = await result;
  //     stdouts.push(ss.stdout);
  //     stderrs.push(ss.stderr);
  //   }


  //   let j = 0 ;

  //   let decisions: boolean[] = [];

  //   for (j = 0 ; j < output.length; j++) {
  //     if (stdouts[j] != output[j]) {
  //       decisions.push(false);
  //     }
  //     else {
  //       decisions.push(true);
  //     }
  //   }

  //   const createdTask = await this.solverRepo.create({
  //     stdout: stdouts,
  //     stderr: stderrs,
  //     input: input,
  //     output: output,
  //     decisions: decisions
  //   });

  //   let isSolved = true;

  //   decisions.map(d => {
  //     if (d == false) {
  //       isSolved = false;
  //     }
  //   })

  //   if (isSolved) {
  //     const user = await this.userRepo.findOne({where: {id: user_id}, relations: ['courses', 'courses.chapters', 'courses.chapters.tutorials']});
  //     const tutorial = await this.tutorialRepo.findOne({where: { user: {id: user_id}, id: tutorial_id}});
  //     tutorial.isCompleted = true;
  //     const savedTutorial = await this.tutorialRepo.save(tutorial);
  //   }

  //   const saved =  this.solverRepo.save(createdTask);
  //   return saved;

  // }




  async doodle(body: CreateSolverDTO): Promise<ResponseDTO> {

    const tutorial = await this.tutorialRepo.findOne({where: { id: body.tutorialId}});
    const user = await this.userRepo.findOne({where: {id: body.userId}});

    let decisions: SolverEntity[] = [];

      tutorial.input.map( (input, index) => {
          let decision: SolverEntity = new SolverEntity();
          const payload = 
            {
              "script": body.userCode,
              "language": "cpp",
              "versionIndex": "0",
              "clientId": "b6f883558bfa91616ea62e0a8d3824c1",
              "clientSecret": "658834d2af24e10b7c946058bdb2495cb64d414e3b83307b59e7406ef2dc03ac",
              "stdin": input
            };
            
          const resp = this.httpService.post(DOODLE_URL, payload).subscribe( (response) => {
            decision.author = user;
            decision.cpuTime = response.data.cpuTime;
            decision.memory = response.data.memory;
            decision.input = input;
            
            decision.output = response.data.output;
            if (response.data.output == tutorial.output[index]) {
              decision.decision = "ACCEPTED";
            } else {
              decision.decision = "WRONG ANSWER";
            }

            const savedDecision = 
            
            decisions.push(decision);
            console.log("response", response.data);
            console.log("decision", decision);
        })
      })

    let isCompleted  = true;
    decisions.map( d => {
      if (d.decision != "ACCEPTED") {
        isCompleted = false;
      }
    })


    decisions.map( d => {
      console.log(d);
    })


    let response: ResponseDTO = {
      decision: isCompleted ? "ACCEPTED" : "WRONG ANSWER",
      tutorialId: body.tutorialId
    };

    return response;
  }
 
}
