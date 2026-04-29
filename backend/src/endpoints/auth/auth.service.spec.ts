import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { AuthModule } from './auth.module';
import { disconnectDB, connectToDB } from '../../lib/mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

describe('AuthService', () => {
    let authService : AuthService;
    let userService: UserService;
    let moduleRef : TestingModule;
    let mongod: MongoMemoryServer;
    let validUser: any;
    let token: string;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                    MongooseModule.forRoot(uri),
                    AuthModule,
                UserModule,
            ],
        }).compile();

        userService = moduleRef.get<UserService>(UserService);
        authService = moduleRef.get<AuthService>(AuthService);

        const dto = { email: 'session@example.com', username: 'test', password: 'strongpass', name: 'SessionUser' };
        const registered = await authService.register(dto);
        validUser = await userService.findByEmail(dto.email);

        // manually login to get a valid token
        const login = await authService.login({ email: dto.email, password: dto.password });
        token = login.token;
    })

    afterEach(async () => {
        await userService.deleteAll();
    })
        
    afterAll(async () => {
        await disconnectDB();
        await mongod.stop();
    })
    
    it('should register a user', async () => {
        const user = await authService.register({
          email: 'test@example.com',
          password: 'password123',
          username: 'tester',
        });
        expect(user.email).toBe('test@example.com');
    });

    it('should login and return token', async () => {
        await authService.register({
            email: 'test@example.com',
            password: 'password123',
            username: 'tester',
        });
        const res = await authService.login({email:'test@example.com', password:'password123'});
        expect(res.token).toBeDefined();
    });

    it('should not allow duplicate registration', async () => {
        await authService.register({
            email: 'dupe@example.com',
            password: 'pass123',
            username: 'dupe1',
        });

        await expect(authService.register({
            email: 'dupe@example.com',
            password: 'pass123',
            username: 'dupe2',
        })).rejects.toThrow(); // or use a custom error
    });

    it('should not login with incorrect password', async () => {
        await authService.register({
            email: 'wrong@example.com',
            password: 'correct',
            username: 'tester',
        });

        await expect(authService.login({
            email: 'wrong@example.com', 
            password: 'wrong' 
        })).rejects.toThrow('Invalid password');
    });

    it('should not login with unregistered email', async () => {
        await expect(authService.login({ 
            email: 'notfound@example.com', 
            password: 'pass' 
        })).rejects.toThrow('No account with this email');
    });

    it('should return session data for valid token', async () => {
        const session = await authService.getSession(token);
        expect(session).toHaveProperty('id', validUser._id);
        expect(session.email).toBe(validUser.email);
        expect(session.name).toBe(validUser.name);
    });

    it('should throw if token is missing', async () => {
        await expect(authService.getSession('')).rejects.toThrow('Missing token');
    });

    it('should throw if token is invalid', async () => {
        await expect(authService.getSession('invalid.token.blob')).rejects.toThrow('Invalid or expired token');
    });

    it('should throw if token is expired', async () => {
        // generate short-lived token
        const shortToken = require('jsonwebtoken').sign(
            { sub: validUser._id },
            process.env.JWT_SECRET!,
            { expiresIn: '1ms' }
        );

        // give it a moment to expire
        await new Promise(r => setTimeout(r, 10));

        await expect(authService.getSession(shortToken)).rejects.toThrow('Invalid or expired token');
    });

    it('should throw if user in token no longer exists', async () => {
        // sign token with fake user ID
        const fakeToken = require('jsonwebtoken').sign(
            { sub: '999999999999999999999999' },
            process.env.JWT_SECRET!
        );

        await expect(authService.getSession(fakeToken)).rejects.toThrow('User not found');
    });
})
