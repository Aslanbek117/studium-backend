import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, OneToMany, JoinColumn, AfterUpdate, BeforeUpdate, ManyToMany } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { SampleUser } from './SampleUser.entity'

@Entity()
export class SamplePost {

  @PrimaryGeneratedColumn()
  id: string;


  @Column()
  name: string;
    
  @ManyToMany(type => SampleUser, su => su.posts)
  users: SampleUser[]

}