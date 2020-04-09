import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, OneToMany, JoinColumn, AfterUpdate, BeforeUpdate, ManyToMany } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { ChapterEntity } from '../chapter/chapter.entity';
import { UserToTutorials } from 'src/user/user-tutorials.entity';



@Entity('tutorial')
export class TutorialEntity {

  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  @Column({default: ''})
  body: string;

  @Column({default: true})
  isLecture: boolean;

  @Column({default: false})
  isCompleted: boolean;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  created: Date;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  updated: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updated = new Date;
  }

  @Column({type: 'simple-array',nullable: true})
  input: string[];

  @Column({ type: 'simple-array',nullable: true})
  output: string[];

  @ManyToOne(type => ChapterEntity, art => art.tutorials, {onDelete: "CASCADE"})
  chapter: ChapterEntity;

  @OneToOne(type => UserEntity, user => user)
  author: UserEntity;

  @OneToMany(type => UserToTutorials, utt => utt.tutorial)
  userToTutorials: UserToTutorials[];
  

  @Column({type: 'simple-array', nullable: true})
  tags: string[];

}