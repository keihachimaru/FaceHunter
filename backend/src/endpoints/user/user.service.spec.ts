import { UserService } from './user.service';
import { UserModule } from './user.module';
import { disconnectDB, connectToDB } from '../../lib/mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule } from '@nestjs/config';
import { Types } from 'mongoose';

describe('UserService', () => {
    let userService: UserService;
    let moduleRef: TestingModule;
    let mongod: MongoMemoryServer;

    beforeAll(async () => { 
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                MongooseModule.forRoot(uri),
                UserModule,
            ],
        }).compile();

        userService = moduleRef.get<UserService>(UserService);
    })

    afterEach(async () => {
        await userService.deleteAll();
    })

    afterAll(async () => {
        await disconnectDB();
        await mongod.stop();
    })

    it('should create a user', async () => {
        const user = await userService.create({
            username: 'user',
            email: 'user@test.com',
            password: 'password1234',
        });

        expect(user.username).toBe('user');
        expect(user.email).toBe('user@test.com');
        expect(user.password).toBe('password1234');
    })

    it('should throw NotFoundException for user', async () => {
        const invalidID = 'randomID1234';
        await expect(
            userService.findById(invalidID)
        ).rejects.toThrow('Invalid ID format');
    })

    it('should delete user', async () => {
        const user = await userService.create({
            username: 'user',
            email: 'user@test.com',
            password: 'password1234',
        })

        await userService.delete(user.id);
        await expect(
            userService.findById(user.id)
        ).rejects.toThrow(`User with id ${user.id} not found`);
    })

    it('should update a user', async () => {
        const user = await userService.create({
            username: 'user',
            email: 'user@test.com',
            password: 'password1234',
        });

        const updated = await userService.update(user.id, {
            comments: [new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString()],
            credits: 100,
        });

        expect(updated.comments.length).toBe(2);
        expect(updated.credits).toBe(100);
    })

    it('should return all users', async () => {
        const user1 = await userService.create({
            username: 'user',
            email: 'user@test.com',
            password: 'password1234',
        });

        const user2 = await userService.create({
            username: 'user2',
            email: 'user2@test.com',
            password: 'password1234',
        });
        
        const users = await userService.getAll();

        expect(users.length).toBe(2);
    })
})
