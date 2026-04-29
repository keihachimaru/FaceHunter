import { Test, TestingModule } from '@nestjs/testing';
import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';
import { UserService } from '../user/user.service';
import { Socket, Server } from 'socket.io';
import { MessageStatus } from '../../models/message.model';
import { JwtModule } from '@nestjs/jwt';

const mockUser = (id: string) => ({ id, username: `user${id}` });

const mockMessage = (id: string, sender: string, receiver: string, content: string) => ({
  _id: id,
  id,
  sender,
  receiver,
  content,
  status: MessageStatus.SENT,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Reusable mock socket
const createMockSocket = (userId: string): Socket => ({
  id: 'mock-socket-id',
  data: { user: { id: userId } },
  join: jest.fn(),
  emit: jest.fn(),
  to: jest.fn().mockReturnThis(),
} as unknown as Socket);

describe('MessageGateway', () => {
  let gateway: MessageGateway;
  let messageService: Partial<Record<keyof MessageService, jest.Mock>>;
  let userService: Partial<Record<keyof UserService, jest.Mock>>;
  let server: Partial<Server>;
  let client: Socket;

  beforeEach(async () => {
    messageService = {
      getMessages: jest.fn(),
      markMessagesAsRead: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
    };

    userService = {
      findById: jest.fn(),
    };

    server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
        imports: [
            JwtModule.register({
                secret: 'test-secret',
                signOptions: { expiresIn: '60s' },
            }),
        ],
        providers: [
            MessageGateway,
            { provide: MessageService, useValue: messageService },
            { provide: UserService, useValue: userService },
        ],
    }).compile();

    gateway = module.get<MessageGateway>(MessageGateway);
    gateway.server = server as Server;

    client = createMockSocket('user1');
  });

  describe('handleJoin', () => {
    it('joins chat and sends chat history', async () => {
      const otherUserID = 'user2';
      const messages = [mockMessage('msg1', 'user1', 'user2', 'hi')];

      (userService.findById as jest.Mock).mockResolvedValue(mockUser(otherUserID));
      (messageService.getMessages as jest.Mock).mockResolvedValue(messages);

      await gateway.handleJoin(client, otherUserID);

      expect(client.join).toHaveBeenCalledWith('chat:user1:user2');
      expect(client.emit).toHaveBeenCalledWith('chatHistory', messages);
      expect(messageService.markMessagesAsRead).toHaveBeenCalledWith('user2', 'user1');
    });
  });

  describe('handleDM', () => {
    it('sends direct message and emits events', async () => {
      const receiverId = 'user2';
      const content = 'hello';
      const msg = mockMessage('msg1', 'user1', receiverId, content);

      (userService.findById as jest.Mock).mockResolvedValue(mockUser(receiverId));
      (messageService.create as jest.Mock).mockResolvedValue(msg);

      await gateway.handleDM(client, [receiverId, content]);

      expect(messageService.create).toHaveBeenCalledWith({
        sender: 'user1',
        receipt: 'user2',
        content,
      });

      expect(client.to).toHaveBeenCalledWith('chat:user1:user2');
      expect(client.to('chat:user1:user2').emit).toHaveBeenCalledWith('newMessage', msg);
      expect(server.to).toHaveBeenCalledWith('notifications:user2');
      expect(server.emit).toHaveBeenCalledWith('newMessageAlert', {
          chatID: 'user1:user2',
          senderID: 'user1',
          messageID: 'msg1',
          preview: content,
      });
    });
  });

  describe('messageReceived', () => {
    it('updates message status to RECEIVED and emits event', async () => {
      const receiverId = 'user2';
      const messageId = 'msg1';
      const msg = mockMessage(messageId, receiverId, 'user1', 'yo');

      (userService.findById as jest.Mock).mockResolvedValue(mockUser(receiverId));
      (messageService.findById as jest.Mock).mockResolvedValue(msg);

      await gateway.handleReception(client, [receiverId, messageId]);

      expect(messageService.update).toHaveBeenCalledWith(messageId, { status: MessageStatus.RECEIVED });
      expect(client.to).toHaveBeenCalledWith('notifications:user1');
      expect(client.to('notifications:user1').emit).toHaveBeenCalledWith('messageReceived', messageId);
    });
  });

  describe('messageRead', () => {
    it('updates message status to READ and emits event', async () => {
      const receiverId = 'user2';
      const messageId = 'msg1';
      const msg = mockMessage(messageId, receiverId, 'user1', 'read it');

      (userService.findById as jest.Mock).mockResolvedValue(mockUser(receiverId));
      (messageService.findById as jest.Mock).mockResolvedValue(msg);

      await gateway.handleRead(client, [receiverId, messageId] );

      expect(messageService.update).toHaveBeenCalledWith(messageId, { status: MessageStatus.READ });
      expect(client.to).toHaveBeenCalledWith('notifications:user1');
      expect(client.to('notifications:user1').emit).toHaveBeenCalledWith('messageRead', messageId);
    });
  });
});
