import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { AuthMiddleware } from './auth.middleware';
import { UserToTutorials } from './user-tutorials.entity';
import { TUT } from './password.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserToTutorials, TUT])],
  providers: [UserService],
  controllers: [
    UserController
  ],
  exports: [UserService]
})
export class UserModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        {path: 'user', method: RequestMethod.GET}, 
      {path: 'user', method: RequestMethod.PUT},
      {path: 'user/:email', method: RequestMethod.GET}, 
      
      );
  }
}
