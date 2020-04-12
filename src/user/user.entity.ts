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


@Entity('user')
export class UserEntity {

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

  @Column({default: 'STUDENT'})
  role: string;

  @Column({default: ''})
  bio: string;

  @Column({default: ''})
  image: string;

  @Column()
  password: string;

  @OneToMany(type => SolverEntity, s => s.ust)
  decisions: SolverEntity[];

  @BeforeInsert()
  hashPassword() {
    this.password = crypto.createHmac('sha256', this.password).digest('hex');
  }

  @ManyToMany(type => CourseEntity, course => course.students, {cascade: true})
  @JoinTable()
  courses: CourseEntity[];

  @OneToMany(type => UserToTutorials, utt => utt.user, {cascade: true, onDelete: "CASCADE"})
  userToTutorials: UserToTutorials[];

}
