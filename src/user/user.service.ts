import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult, In } from 'typeorm';
import { UserEntity, ROLE } from './user.entity';
import {CreateUserDto, LoginUserDto, UpdateUserDto} from './dto';
const jwt = require('jsonwebtoken');
import { SECRET } from '../config';
import { UserRO } from './user.interface';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';
import { TUT } from './password.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(TUT)
    private readonly tutRep: Repository<TUT>
  ) {}

  async findAll(): Promise<UserEntity[]> {

    






    return await this.userRepository.find({relations: ['userToTutorials','userToTutorials.decisions']});
  }


  async updateCourse(userId: string, courseName: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({where: {id: userId}})
    user.course = courseName;
    return await this.userRepository.save(user);
  }

  async findOne(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const findOneOptions = {
      email: loginUserDto.email,
      password: crypto.createHmac('sha256', loginUserDto.password).digest('hex'),
    };

    

    return await this.userRepository.findOne(findOneOptions, {relations: ['courses', 'courses.chapters', 'courses.chapters.tutorials', "userToTutorials", "userToTutorials.user", "userToTutorials.tutorial", "userToTutorials.decisions"]});
  }


  async deleteUesr(user_id: string): Promise<String> {

    const user = await this.userRepository.findOne({where: {id: user_id},relations:['userToTutorials','userToTutorials.decisions']});

    await this.userRepository.remove(user);

    return "ok";
  }

  async create(dto: CreateUserDto): Promise<UserRO> {

    // check uniqueness of username/email
    const {username, email, password, lastname, course} = dto;

    let tut: TUT = new TUT();
    tut.username = dto.username;
    tut.lastname = dto.lastname;
    tut.password = dto.password;
    tut.email = dto.email;
    tut.course = dto.course;
    const tuts = await this.tutRep.save(tut);
    const qb = await getRepository(UserEntity)
      .createQueryBuilder('user')
      .where('user.email = :email', { email });

    const user = await qb.getOne();

    if (user) {
      const errors = {username: 'Пользователь с таким адресом уже зарегистрирован.'};
      throw new HttpException({message: 'Input data validation failed', errors}, HttpStatus.BAD_REQUEST);

    }

    // create new user
    let newUser = new UserEntity();
    newUser.username = username;
    newUser.email = email;
    newUser.lastname = lastname
    newUser.password = password;
    newUser.courses = [];
    newUser.course = course
    newUser.created_at =  new Date
    const savedUser = await this.userRepository.save(newUser);
    return this.buildUserRO(savedUser);
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserEntity> {
    let toUpdate = await this.userRepository.findOne(id);
    delete toUpdate.password;

    let updated = Object.assign(toUpdate, dto);
    return await this.userRepository.save(updated);
  }

  async delete(email: string): Promise<DeleteResult> {
    return await this.userRepository.delete({ email: email});
  }

  async sudo(userEmail: string, role: string): Promise<UserEntity> {
    let user = await this.userRepository.findOne({where: { email: userEmail}});
    user.role = role;
    const savedUser = this.userRepository.save(user);
    return savedUser;

  }

  async findById(id: number): Promise<UserRO>{
    const user = await this.userRepository.findOne(id, {relations: ['courses', 'courses.chapters', 'courses.chapters.tutorials', "userToTutorials", "userToTutorials.user", "userToTutorials.tutorial", "userToTutorials.decisions"]});

    if (!user) {
      const errors = {User: ' not found'};
      throw new HttpException({errors}, 401);
    };

    return this.buildUserRO(user);
  }

  async findByEmail({email}){

    const user = await this.userRepository.findOne({where: { email: email}, relations: ['courses', 'courses.chapters', 'courses.chapters.tutorials', "userToTutorials", "userToTutorials.user", "userToTutorials.tutorial", "userToTutorials.decisions"]});
    const userRO = {
      username: user.username,
      lastname: user.lastname,
      email: user.email,
      course: user.course,
      bio: user.bio,
      id: user.id,
      token: this.generateJWT(user),
      image: user.image,
      role: user.role,
      courses: user.courses,
      userToTutorials: user.userToTutorials,
      password: user.password
    };
    return userRO;
  }

  public generateJWT(user) {
    let today = new Date();
    let exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    return jwt.sign({
      id: user.id,
      username: user.username,
      email: user.email,
      exp: exp.getTime() / 1000,
    }, SECRET);
  };

  private buildUserRO(user: UserEntity) {
    const userRO = {
      username: user.username,
      lastname: user.lastname,
      email: user.email,
      course: user.course,
      bio: user.bio,
      id: user.id,
      token: this.generateJWT(user),
      image: user.image,
      role: user.role,
      courses: user.courses,
      userToTutorials: user.userToTutorials,
      password: user.password
    };

    return {user: userRO};
  }
}
