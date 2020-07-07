import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from 'typeorm';
import { TutorialEntity } from 'src/tutorial/tutorial.entity';
import { UserEntity } from 'src/user/user.entity';
import { CourseEntity } from 'src/course/course.entity';
import { Topic } from '../topic/topic.entity';

@Entity('commentEntity')
export class Comment {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  body: string;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  created: Date;

  @ManyToOne(type => UserEntity, user => user.comments, {nullable: true, cascade: true})
  user: UserEntity;

  @ManyToOne(type => Topic, topic => topic.comments, {nullable: true, cascade: true, onDelete: 'CASCADE'})
  topic: Topic;
}