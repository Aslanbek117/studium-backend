import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, OneToMany, JoinColumn, AfterUpdate, BeforeUpdate } from 'typeorm';
import { UserEntity } from '../user/user.entity';

@Entity('decision')
export class SolverEntity {

  @PrimaryGeneratedColumn()
  id: string;

  @Column({nullable: true})
  tutorial_id: string;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  created: Date;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  updated: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updated = new Date;
  }

  @Column({nullable: true})
  input: string;

  @Column({nullable: true})
  output: string;

  @Column({nullable: true})
  decision: string;

  @Column({nullable: true})
  memory: string;

  @Column({nullable: true})
  cpuTime: string;

  @ManyToOne(type => UserEntity, user => user.courses)
  author: UserEntity;

}