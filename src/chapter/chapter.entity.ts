import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, OneToMany, JoinColumn, AfterUpdate, BeforeUpdate } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { CourseEntity } from '../course/course.entity';
import { TutorialEntity } from '../tutorial/tutorial.entity';

@Entity('chapter')
export class ChapterEntity {

  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  @Column({default: ''})
  body: string;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  created: Date;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  updated: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updated = new Date;
  }

  @ManyToOne(type => CourseEntity, art => art.chapters, {onDelete: "CASCADE"})
  course: CourseEntity;

  @OneToMany(type => TutorialEntity, t => t.chapter, {onDelete: "CASCADE", cascade: true})
  tutorials: TutorialEntity[];

  @ManyToOne(type => UserEntity, user => user.courses, {onDelete: "CASCADE"})
  author: UserEntity;

  @Column({nullable: true, default: false})
  isCompleted: boolean;

  @Column({type: 'simple-array', nullable: true})
  tags: string[];

}