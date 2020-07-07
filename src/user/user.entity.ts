import {Entity, PrimaryGeneratedColumn, Column, BeforeInsert, JoinTable, ManyToMany, OneToMany, ManyToOne, OneToOne} from "typeorm";
import * as crypto from 'crypto';
import { CourseEntity } from '../course/course.entity';
import { TutorialEntity } from "src/tutorial/tutorial.entity";
import { Comment } from '../comment/comment.entity';
import { UserToTutorials } from './user-tutorials.entity';
import { SolverEntity } from "src/solver/solver.entity";
import { Topic } from "src/topic/topic.entity";

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

  @Column({nullable: true})
  created_at: Date

  @Column()
  email: string;

  @Column({default: 'STUDENT'})
  role: string;

  @Column({default: ''})
  bio: string;

  @Column({default: ''})
  image: string;

  @Column({select: false})
  password: string;

  @OneToMany(type => Topic, topic => topic.user, {nullable: true})
  topics: Topic[];

  @OneToMany(type=> Comment, comment => comment.user, {nullable: true})
  comments: Comment[];


  @BeforeInsert()
  hashPassword() {
    this.password = crypto.createHmac('sha256', this.password).digest('hex');
  }

  @ManyToMany(type => CourseEntity, course => course.students, {cascade: true, onUpdate:'CASCADE'})
  @JoinTable()
  courses: CourseEntity[];

  @OneToMany(type => UserToTutorials, utt => utt.user, {cascade: true, onDelete: "CASCADE", onUpdate: 'CASCADE'})
  userToTutorials: UserToTutorials[];

}
