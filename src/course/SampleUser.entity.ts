import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, OneToMany, JoinColumn, AfterUpdate, BeforeUpdate, ManyToMany, JoinTable } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { SamplePost } from './SamplePost.entity';


@Entity()
export class SampleUser {

  @PrimaryGeneratedColumn()
  id: string;


  @Column()
  name: string;
    
  @ManyToMany(type => SamplePost, sp => sp.users, {cascade: true})
  @JoinTable()
  posts: SamplePost[];

}