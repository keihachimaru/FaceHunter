import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
    ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
import { UserService } from '../user/user.service';
import { JwtWsGuard } from './jwt-ws.guard';
import { UseGuards, BadRequestException } from '@nestjs/common';
import { CreateMessageDTO } from './dto/message.dto';
import { Buffer } from 'buffer';
import { getChatRoomName } from '../../utils/utils';
import { MessageStatus } from '../../models/message.model';
import { NotFoundException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

//@UseGuards(JwtWsGuard)
@WebSocketGateway({
    namespace: '/wschat',
    cors: { origin: '*' },
})
export class MessageGateway 
    implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection
{
    @WebSocketServer() server: Server;

    constructor(
        private readonly userService: UserService,
        private readonly messageService: MessageService,
    ) {}
    


    afterInit(server: Server) {
    
        console.log('Game Gateway initialized');
        server.use((socket, next) => {
          try {
            const token = socket.handshake.auth.token as string;
            if (!token) throw new Error('Missing token');
    
            const payload = jwt.verify(token, process.env.JWT_SECRET!);
            socket.data.user = { id: payload.sub };
            next();
          } catch (err) {
            console.log(err);
            next(new Error('Unauthorized'));
          }
        });
    }

    async handleConnection(
        client: Socket
    ) {
        const currentUserID = client.data.user.id;
        console.log(`Client connected: ${currentUserID}`);
        client.join(`notifications:${currentUserID}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinChat')
    async handleJoin(
        @ConnectedSocket() client: Socket,
        @MessageBody() otherUserID: string,
    ) {
        console.log('joining chat ...');
        const currentUserID = client.data.user.id;

        if(currentUserID==otherUserID) throw new BadRequestException('Can not chat with yourself');

        const currentUser = this.userService.findById(currentUserID);
        const otherUser = this.userService.findById(otherUserID);
        
        if(!currentUser || !otherUser) {
            throw new NotFoundException('User not found');
        }
        
        const roomName = getChatRoomName(currentUserID, otherUserID);
        client.join(`chat:${roomName}`);
        
        const history = await this.messageService.getMessages(
            currentUserID,
            otherUserID,
            50
        );
        
        client.emit('chatHistory', history);

        await this.messageService.markMessagesAsRead(otherUserID, currentUserID);
    }

    @SubscribeMessage('dm')
    async handleDM(
        @ConnectedSocket() client: Socket,
        @MessageBody() [ receiptID, content ] : [ string, string ]
    ) {
        const senderID = client.data.user.id;
        if(receiptID==senderID) throw new BadRequestException('Can not send messages to yourself');

        const receipt = await this.userService.findById(receiptID);
        const sender = await this.userService.findById(senderID);
        if(!receipt || !sender) throw new NotFoundException('User not found');
        const message = await this.messageService.create({
            content: content,
            receipt: receiptID,
            sender: senderID
        });
        
        const chatID = getChatRoomName(receiptID, senderID);
        this.server.to(`chat:${chatID}`).emit(`newMessage`, message);
        
        this.server.to(`notifications:${receiptID}`).emit(
            'newMessageAlert',
            {
                chatID: chatID,
                senderID: senderID,
                messageID: message.id,
                preview: content.substring(0, 15)
            }
        )
    }

    @SubscribeMessage('messageReceived')
    async handleReception(
        @ConnectedSocket() client: Socket,
        @MessageBody() [ receiptID, messageID ] : [ string, string ]
    ) {
        const senderID = client.data.user.id;
        if(receiptID==senderID) throw new BadRequestException('Can not send messages to yourself');

        const receipt = await this.userService.findById(receiptID);
        const sender = await this.userService.findById(senderID);
        if(!receipt || !sender) throw new NotFoundException('User not found');
        
        const message = await this.messageService.findById(messageID);
        
        if(!message) throw new NotFoundException('Message not found');
        
        await this.messageService.update(messageID, { status: MessageStatus.RECEIVED });
        
        client.to(`notifications:${senderID}`).emit('messageReceived', messageID);
    }

    @SubscribeMessage('messageRead')
    async handleRead(
        @ConnectedSocket() client: Socket,
        @MessageBody() [ receiptID, messageID ] : [ string, string ]
    ) {
        const senderID = client.data.user.id;
        if(receiptID==senderID) throw new BadRequestException('Can not send messages to yourself');

        const receipt = await this.userService.findById(receiptID);
        const sender = await this.userService.findById(senderID);
        if(!receipt || !sender) throw new NotFoundException('User not found');
        
        const message = await this.messageService.findById(messageID);
        
        if(!message) throw new NotFoundException('Message not found');
        
        await this.messageService.update(messageID, { status: MessageStatus.READ });
        const chatID = getChatRoomName(receiptID, senderID);
        
        client.to(`notifications:${senderID}`).emit('messageRead', messageID);
    }
}
