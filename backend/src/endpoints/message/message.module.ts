// message.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageService } from './message.service';
import { Message, MessageSchema } from '../../models/message.model';
import { JwtModule } from '@nestjs/jwt';
import { JwtWsGuard } from './jwt-ws.guard';
import { MessageGateway } from './message.gateway';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    forwardRef(() => UserModule),
    JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: '1d' } }),
  ],
  providers: [MessageService, MessageGateway, JwtWsGuard],
  exports: [MessageService, JwtWsGuard ],
})
export class MessageModule {}
