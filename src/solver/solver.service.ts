import { Injectable, HttpService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult, In } from 'typeorm';
import { SolverEntity, JDoodleResponse, FrontResponseDTO } from './solver.entity';
import { CreateSolverDTO, ResponseDTO } from './dto';
import { CourseEntity } from '../course/course.entity';
import { create } from 'domain';
import { TutorialEntity } from '../tutorial/tutorial.entity';
import { UserEntity } from '../user/user.entity';
import { UserToTutorials } from 'src/user/user-tutorials.entity';
import { timer } from 'rxjs';

var fs = require('fs');

const { c, cpp, node, python, java } = require('compile-run');
const DOODLE_URL = "https://api.jdoodle.com/v1/execute";



@Injectable()
export class SolverService {
  constructor(
    @InjectRepository(SolverEntity)
    private readonly solverRepo: Repository<SolverEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,
    @InjectRepository(TutorialEntity)
    private readonly tutorialRepo: Repository<TutorialEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserToTutorials)
    private readonly userToTutorialsRepository: Repository<UserToTutorials>,
    private httpService: HttpService
  ) { }

  async findAll(body: CreateSolverDTO): Promise<SolverEntity> {
    const user = await this.userRepo.findOne({ where: { id: body.userId } });
    const tutorial = await this.tutorialRepo.findOne({ where: { id: body.tutorialId } })
    const fileName: string = user.email + "-" + tutorial.id + ".c";
    fs.writeFile(
      __dirname + "/" + fileName,
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




  async doodle(body: CreateSolverDTO): Promise<FrontResponseDTO> {

    const tutorial = await this.tutorialRepo.findOne({ where: { id: body.tutorialId } });

    const user = await this.userRepo.findOne({ where: { id: body.userId } });

    const ust = await this.userToTutorialsRepository.findOne({ where: { userId: body.userId, tutorialId: body.tutorialId } });
    let isCompleted = true;
    let decisions: SolverEntity[] = [];

    let i = 0;

    for (i = 0; i< tutorial.input.length; i++) {
      let decision: SolverEntity = new SolverEntity();
      const resp = await this.sendToDoodle(body.userCode, "cpp" ,tutorial.input[i], tutorial.output[i]);
      if (resp.output == tutorial.output[i]) {
        isCompleted = true;
      } else {isCompleted = false};

      decision.input = tutorial.input[i];
      decision.output = resp.output;
      decision.decision = isCompleted ? "ПРИНЯТО" : "ОШИБКА"
      decision.memory = resp.memory 
      decision.cpuTime  = resp.cpuTime
      decision.code = body.userCode;
      decision.tutorial = tutorial.id;
      decision.user = user.id.toString();
      decision.ust = ust;
      decisions.push(decision);
      
    }

    let j = 0;

    for (j = 0; j< decisions.length; j++) {
      await this.solverRepo.save(decisions[j]);
    }

    
    ust.isCompleted = isCompleted;
    ust.code = body.userCode;

    await this.userToTutorialsRepository.save(ust);



    const items = await this.solverRepo.find({where: {id:  user.id}});


    let response: FrontResponseDTO = {
      decisions: items
    };

    return response;
  }



  async sendToDoodle(script: string, language: string, stdin: string, output: string): Promise<JDoodleResponse> {
    const payload =
      {
        "script": script,
        "language": "cpp",
        "versionIndex": "0",
        "clientId": "b6f883558bfa91616ea62e0a8d3824c1",
        "clientSecret": "658834d2af24e10b7c946058bdb2495cb64d414e3b83307b59e7406ef2dc03ac",
        "stdin": stdin
      };
    let decisions: SolverEntity[] = [];
    const response = await this.httpService.post(DOODLE_URL, payload).toPromise();
      console.log("e", response.data);
    const data: JDoodleResponse = response.data;
  
    
    return data;
    
  }

}
