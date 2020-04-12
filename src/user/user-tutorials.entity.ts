import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { UserEntity } from "./user.entity";
import { TutorialEntity } from "../tutorial/tutorial.entity";
import { SolverEntity } from "src/solver/solver.entity";

@Entity()
export class UserToTutorials {
    @PrimaryGeneratedColumn()
    public UserToTutorialId!: number;

    @Column()
    public userId!: number;
    
    @Column()
    public tutorialId!: number;
   
    @Column({nullable: true})
    username: string;

    @Column({nullable: true})
    lastname: string;

    @Column({nullable: true})
    email: string;

    @Column({nullable: true})
    course: string;

    @Column({nullable: true})
    code: string;

    @Column({default: false})
    isCompleted: boolean;

    @OneToMany(type => SolverEntity, s => s.ust)
     decisions: SolverEntity[];

    @Column({type: 'timestamp', nullable: true})
    complete_date: Date
    
    @Column({default: false})
    isViewed: boolean;

    @Column({type: 'timestamp', nullable: true})
    view_date: Date;

    @ManyToOne(type => UserEntity, user => user.userToTutorials, {onDelete: 'CASCADE'})
    public user!: UserEntity;

    @ManyToOne(type => TutorialEntity, tutorial => tutorial.userToTutorials, {onDelete: 'CASCADE'})
    public tutorial!: TutorialEntity;
}