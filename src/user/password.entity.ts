import {Entity, PrimaryGeneratedColumn, Column, BeforeInsert, JoinTable, ManyToMany, OneToMany, ManyToOne} from "typeorm";
import * as crypto from 'crypto';
import { CourseEntity } from '../course/course.entity';
import { TutorialEntity } from "src/tutorial/tutorial.entity";

import { UserToTutorials } from './user-tutorials.entity';
import { SolverEntity } from "src/solver/solver.entity";

export enum ROLE {
  ADMIN,
  TEACHER,
  MENTOR,
  STUDENT
}


@Entity('tut')
export class TUT {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  lastname: string;

  @Column({nullable: true})
  course: string;

  @Column()
  email: string;

  @Column()
  password: string;

}
