import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, OneToMany, JoinColumn, AfterUpdate, BeforeUpdate } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { Comment } from './comment.entity';
import { TutorialEntity } from '../tutorial/tutorial.entity';
import { ChapterEntity } from '../chapter/chapter.entity';

@Entity('course')
export class CourseEntity {

  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  slug: string;

  @Column()
  title: string;

  @Column({default: ''})
  description: string;

  @Column({default: ''})
  body: string;

  @Column({default: ''})
  card_description: string;

  @Column({default: ''})
  course_overview: string;

  @Column({default: ''})
  img_url: string;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  created: Date;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  updated: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updated = new Date;
  }

  @Column('simple-array', {nullable: true})
  tagList: string[];

  @ManyToOne(type => UserEntity, user => user.courses)
  author: UserEntity;


  @OneToMany(type => ChapterEntity, ch => ch.course, {onDelete: "CASCADE"})
  @JoinColumn()
  chapters: ChapterEntity[];

  @Column({nullable: true})
  chapterCount: string;


  @Column({nullable: true})
  tutorialCount: string;

  @OneToMany(type => Comment, comment => comment.article, {eager: true, onDelete: "CASCADE"})
  @JoinColumn()
  comments: Comment[];

  @Column({default: 0})
  favoriteCount: number;
}