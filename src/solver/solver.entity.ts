import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, OneToMany, JoinColumn, AfterUpdate, BeforeUpdate } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { TutorialEntity } from 'src/tutorial/tutorial.entity';
import { UserToTutorials } from 'src/user/user-tutorials.entity';

@Entity('decision')
export class SolverEntity {

  @PrimaryGeneratedColumn()
  id: string;

  @Column({nullable: true})
  tutorialId: string;

  @Column({ nullable: true})
  userId: string;


  @Column({nullable: true})
  mentorComment: string;

  @Column({nullable: true})
  mentorId: string;

  @Column({nullable: true})
  teacherId: string;

  @Column({nullable: true})
  teacherComment: string;

  @Column({nullable: true})
  code: string;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  created: Date;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  updated: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updated = new Date;
  }

  @Column('simple-array', {nullable: true})
  input: any[];

  @Column('simple-array', {nullable: true})
  expectedOutput: any[];

  @Column('simple-array', {nullable: true})
  output: any[];

  @Column({nullable: true})
  decision: string;

  @Column({nullable: true})
  memory: string;

  @Column({nullable: true})
  cpuTime: string;

  @ManyToOne(type => UserToTutorials, a => a.decisions)
  ust: UserToTutorials;

}



export interface JDoodleResponse {
  output: string;
  memory: string;
  cpuTime: string;
}



export interface FrontResponseDTO {
  decisions: SolverEntity[];
}