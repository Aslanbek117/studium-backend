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


  async createComment(user_id: string, tutorial_id: string, mentor_id: string, comment: string, createdAt: string) {
    const item = await this.solverRepo.find({where: {userId: user_id, tutorialId: tutorial_id}});
    const found = item.find(i => {
      let date = i.created.toISOString().toString().split("T")[0];
        let date1 = i.created.toISOString().toString().split("T")[1].split(".")[0];
        const result = date + " " + date1;
        console.log("result", result)
        if (result == createdAt) {
          return i;
        }
    })
    found.mentorComment = comment;
    found.mentorId = mentor_id;
    return await this.solverRepo.save(found);
  }

  async createTeacherComment(user_id: string, tutorial_id: string, teacher_id: string, comment: string, createdAt: string) {
    const item = await this.solverRepo.find({where: {userId: user_id, tutorialId: tutorial_id}});
    const found = item.find(i => {
      let date = i.created.toISOString().toString().split("T")[0];
        let date1 = i.created.toISOString().toString().split("T")[1].split(".")[0];
        const result = date + " " + date1;
        if (result == createdAt) {
          return i;
        }
    })
    found.teacherComment = comment;
    found.teacherId = teacher_id;
    return await this.solverRepo.save(found);
  }



  async doodle(body: CreateSolverDTO): Promise<FrontResponseDTO> {

    const tutorial = await this.tutorialRepo.findOne({ where: { id: body.tutorialId } });

    const user = await this.userRepo.findOne({ where: { id: body.userId } });

    const ust = await this.userToTutorialsRepository.findOne({ where: { userId: body.userId, tutorialId: body.tutorialId } });
    let isCompleted = true;
    let decisions: SolverEntity[] = [];

    let i = 0;
    if (tutorial.input == undefined ||  tutorial.input.length == 0) {
      tutorial.input = ['test'];
      tutorial.output = ['test'];
    }
    let decision: SolverEntity = new SolverEntity();
    decision.input = [];
    decision.output = [];
    decision.expectedOutput = [];
    for (i = 0; i< tutorial.input.length; i++) {
      
      const resp = await this.sendToDoodle(body.userCode, "java" ,tutorial.input[i], tutorial.output[i]);
      if (resp.output.toString().replace(/[\n\t\r]/g,"") == tutorial.output[i].toString().replace(/[\n\t\r]/g,"")) {
        isCompleted = true;
      } else {isCompleted = false};

      decision.input.push(tutorial.input[i]);
      decision.output.push(resp.output);
      decision.decision = isCompleted ? "ПРИНЯТО" : "Неправильный ответ"
      decision.memory = resp.memory 
      decision.expectedOutput.push(tutorial.output[i])
      decision.cpuTime  = resp.cpuTime
      decision.code = body.userCode;
      decision.tutorialId = tutorial.id;
      decision.userId = user.id.toString();
      decision.ust = ust;
      decisions.push(decision);
      
    }

    let j = 0;

    for (j = 0; j< decisions.length; j++) {
      await this.solverRepo.save(decisions[j]);
    }

    
    ust.isCompleted = isCompleted;
    ust.isViewed = true;
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
        "language": "java",
        "versionIndex": "0",
        "clientId": "b6f883558bfa91616ea62e0a8d3824c1",
        "clientSecret": "658834d2af24e10b7c946058bdb2495cb64d414e3b83307b59e7406ef2dc03ac",
        "stdin": stdin
      };
    let decisions: SolverEntity[] = [];
    const response = await this.httpService.post(DOODLE_URL, payload).toPromise();
    const data: JDoodleResponse = response.data;
    console.log("output", data.output);
  
    
    return data;
    
  }

}
