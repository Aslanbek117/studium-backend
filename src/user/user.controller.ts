import { Get, Post, Body, Put, Delete, Param, Controller, UsePipes } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { UserEntity, ROLE } from './user.entity';
import { UserRO } from './user.interface';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from './dto';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { User } from './user.decorator';
@Controller("user")
export class UserController {

  constructor(private readonly userService: UserService) {}

  @Get(':email')
  async findMe(@Param() email): Promise<UserEntity> {
    console.log("find by email");
    return await this.userService.findByEmail(email);
  }

  @Get('/users')
  async findAll(): Promise<UserEntity[]> {
    return await this.userService.findAll();
  }

  // @Get("dictionary/all")
  // async getDictionary(): Promise<DictionaryEntity[]> {
  //   console.log("DIc get")
  //   return await this.userService.getDictionary();
  // }

  // @Post('dictionary/remove')
  // async deleteDictionary(@Body("dictionaryId") id: string) {
  //   return await this.userService.deleteDic(id);
  // }

  // @Post('dictionary/create')
  // async addCourse(@Body('course') courseName: string): Promise<DictionaryEntity> {
  //   console.log("DIc post", courseName);
  //   return await this.userService.createDictinary(courseName);
  // }

  @Post('update')
  async update(@User('id') userId: number, @Body('user') userData: UpdateUserDto) {
    return await this.userService.update(userId, userData);
  }

  @Post('create')
  async create(@Body('user') userData: CreateUserDto) {
    console.log("DAD", userData);
    return this.userService.create(userData);
  }

  @Post('sudo')
  async grant(@Body('email') userEmail: string, @Body("role") role: string) {
    return await this.userService.sudo(userEmail, role);
  }

  @Post('login')
  async login(@Body('user') loginUserDto: LoginUserDto): Promise<UserRO> {
    const _user = await this.userService.findOne(loginUserDto);
    console.log("ITS WORKING")
    const errors = {User: ' not found'};
    if (!_user) throw new HttpException({errors}, 401);

    const token = await this.userService.generateJWT(_user);
    
    const {email, username, lastname, course, bio, image, role, id, courses} = _user;
    const user = {email, token, username, lastname, course, bio, image, role, id, courses};
    return {user};
  }
}
