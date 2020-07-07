import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { TutorialEntity } from 'src/tutorial/tutorial.entity';
import { UserEntity } from 'src/user/user.entity';
import { CourseEntity } from 'src/course/course.entity';
import { Comment } from '../comment/comment.entity';

@Entity('topic')
export class Topic {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({nullable: true})
  body: string;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  created: Date;

  @ManyToOne(type => UserEntity, user => user.topics, {nullable: true})
  user: UserEntity;

  @OneToMany(type=> Comment, comment => comment.topic, {nullable: true, onDelete: 'CASCADE'})
  comments: Comment[];

  @ManyToOne(type => CourseEntity, course => course.topics, {nullable: true})
  course: CourseEntity;
}