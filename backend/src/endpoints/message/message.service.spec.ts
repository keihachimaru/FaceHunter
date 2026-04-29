import { MessageService } from './message.service';
import { MessageModule } from './message.module';
import { disconnectDB, connectToDB } from '../../lib/mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule } from '@nestjs/config';
import { Types } from 'mongoose';
import { MessageStatus } from '../../models/message.model';

describe('MessageService', () => {
    let messageService: MessageService;
    let moduleRef: TestingModule;
    let mongod: MongoMemoryServer;

    beforeAll(async () => { 
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                MongooseModule.forRoot(uri),
                MessageModule,
            ],
        }).compile();

        messageService = moduleRef.get<MessageService>(MessageService);
    })

    afterEach(async () => {
        await messageService.deleteAll();
    })

    afterAll(async () => {
        await disconnectDB();
        await mongod.stop();
    })

    it('should create a message', async () => {
        const message = await messageService.create({
            sender: 'user1',
            receipt: 'user2',
            content: 'testMessage',
        });

        expect(message.sender).toBe('user1');
        expect(message.receipt).toBe('user2');
        expect(message.content).toBe('testMessage');
    })

    it('should throw NotFoundException for message', async () => {
        const invalidID = 'randomID1234';
        await expect(
            messageService.findById(invalidID)
        ).rejects.toThrow('Invalid ID format');
    })

    it('should delete message', async () => {
        const message = await messageService.create({
            sender: 'user1',
            receipt: 'user2',
            content: 'testMessage',
        })

        await messageService.delete(message.id);
        await expect(
            messageService.findById(message.id)
        ).rejects.toThrow(`Message with id ${message.id} not found`);
    })

    it('should update a message', async () => {
        const message = await messageService.create({
            sender: 'user1',
            receipt: 'user2',
            content: 'testMessage',
        });

        const updated = await messageService.update(message.id, {
            status: MessageStatus.READ,
        });

        expect(updated.status).toBe(MessageStatus.READ);
    })

    it('should return all messages', async () => {
        const message1 = await messageService.create({
            sender: 'user1',
            receipt: 'user2',
            content: 'testMessageOne',
        });

        const message2 = await messageService.create({
            sender: 'user2',
            receipt: 'user1',
            content: 'testMessageTwo',
        });
        
        const messages = await messageService.getAll();

        expect(messages.length).toBe(2);
    })

    it('should return all messages between two users in ascending order and limit the result', async () => {
        const userA = 'userA';
        const userB = 'userB';
    
        await messageService.create({ sender: userA, receipt: userB, content: 'hello1' });
        await new Promise(res => setTimeout(res, 10));
        await messageService.create({ sender: userB, receipt: userA, content: 'hello2' });
        await new Promise(res => setTimeout(res, 10));
        await messageService.create({ sender: userA, receipt: userB, content: 'hello3' });
    
        const messages = await messageService.getMessages(userA, userB, 2);
    
        expect(messages.length).toBe(2);
        expect(messages[0].content).toBe('hello1');
        expect(messages[1].content).toBe('hello2');
    });

    it('should mark all unread messages from sender to receipt as READ', async () => {
        const sender = 'user1';
        const receipt = 'user2';
    
        await messageService.create({ sender, receipt, content: 'msg1' });
        await messageService.create({ sender, receipt, content: 'msg2' });
        await messageService.create({ sender, receipt, content: 'msg3' });
    
        const modifiedCount = await messageService.markMessagesAsRead(sender, receipt);
        expect(modifiedCount).toBe(3);
    
        const updatedMessages = await messageService.getMessages(sender, receipt, 10);
        const unreadMessages = updatedMessages.filter(msg => msg.status !== MessageStatus.READ );
        expect(unreadMessages.length).toBe(0);
    });

    it('should return 0 if no unread messages to mark as READ', async () => {
        const sender = 'userX';
        const receipt = 'userY';
    
        await messageService.create({ sender, receipt, content: 'alreadyRead1' });
    
        const modifiedCount = await messageService.markMessagesAsRead(sender, receipt);
        expect(modifiedCount).toBe(1);
    });
})
