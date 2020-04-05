import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, OneToMany, JoinColumn, AfterUpdate, BeforeUpdate } from 'typeorm';
import { UserEntity } from '../user/user.entity';

@Entity('solver')
export class SolverEntity {

  @PrimaryGeneratedColumn()
  id: string;

  @Column({nullable: true})
  taskId: string;

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

  @Column({type: 'simple-array',nullable: true})
  input: string[];

  @Column({ type: 'simple-array',nullable: true})
  output: string[];

  @Column({type: 'simple-array', nullable: true })
  stdout: string[];

  @Column({type: 'simple-array', nullable: true})
  stderr: string[];

  @Column({type: 'simple-array', nullable: true})
  decisions: boolean[];

  @ManyToOne(type => UserEntity, user => user.courses)
  author: UserEntity;

}