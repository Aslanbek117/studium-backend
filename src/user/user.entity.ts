import {Entity, PrimaryGeneratedColumn, Column, BeforeInsert, JoinTable, ManyToMany, OneToMany} from "typeorm";
import * as crypto from 'crypto';
import { CourseEntity } from '../course/course.entity';

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

  @BeforeInsert()
  hashPassword() {
    this.password = crypto.createHmac('sha256', this.password).digest('hex');
  }

  // @ManyToMany(type => ArticleEntity)
  // @JoinTable()
  // favorites: ArticleEntity[];

  @ManyToMany(type => CourseEntity, course => course.students, {cascade: true})
  @JoinTable()
  courses: CourseEntity[];
}
