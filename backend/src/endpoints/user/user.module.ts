import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User, UserSchema } from '../../models/user.model';
import { UserController } from './user.controller';
import { MessageModule } from '../message/message.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MessageModule
  ],
  providers: [ UserService, JwtAuthGuard ],
  controllers: [UserController],
  exports: [ UserService ],
})

export class UserModule {}
