import { LikeService } from './like.service';
import { LikeModule } from './like.module';
import { disconnectDB, connectToDB } from '../../lib/mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule } from '@nestjs/config';
import { Types } from 'mongoose';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';

describe('LikeService', () => {
    let likeService: LikeService;
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
                LikeModule,
                UserModule
            ],
        }).compile();

        likeService = moduleRef.get<LikeService>(LikeService);
        userService = moduleRef.get<UserService>(UserService);
    })

    afterEach(async () => {
        await likeService.deleteAll();
    })

    afterAll(async () => {
        await disconnectDB();
        await mongod.stop();
    })

    it('should create a like', async () => {
        const like = await likeService.create({
            author: 'author1',
            facehunt: 'facehunt1',
        });

        expect(like.author).toBe('author1');
        expect(like.facehunt).toBe('facehunt1');
        expect(like.value).toBe(true);
    })

    it('should throw NotFoundException for like', async () => {
        const invalidID = 'randomID1234';
        await expect(
            likeService.findById(invalidID)
        ).rejects.toThrow('Invalid ID format');
    })

    it('should delete like', async () => {
        const like = await likeService.create({
            author: 'author1',
            facehunt: 'facehunt1',
        })

        await likeService.delete(like.id);
        await expect(
            likeService.findById(like.id)
        ).rejects.toThrow(`Like with id ${like.id} not found`);
    })

    it('should update a like', async () => {
        const like = await likeService.create({
            author: 'author1',
            facehunt: 'facehunt1',
        });

        const updated = await likeService.update(like.id, {
            value: false,
        });

        expect(updated.value).toBe(false);
    })

    it('should return all likes', async () => {
        const like1 = await likeService.create({
            author: 'author1',
            facehunt: 'facehunt1',
        });

        const like2 = await likeService.create({
            author: 'author2',
            facehunt: 'facehunt2',
        });
        
        const likes = await likeService.getAll();

        expect(likes.length).toBe(2);
    })

    it('should return true if user liked the post', async () => {
        const userId = 'user1';
        const facehuntId = 'facehunt1';

        await likeService.create({ author: userId, facehunt: facehuntId });

        const liked = await likeService.hasUserLikedPost(userId, facehuntId);

        expect(liked).toBe(true);
    });

    it('should return false if user has not liked the post', async () => {
        const userId = 'user2';
        const postId = 'post2';
        
        
        const liked = await likeService.hasUserLikedPost(userId, postId);
        
        expect(liked).toBe(false);
    });

    it('should return the like if it exists for the given user and facehunt', async () => {
        const userId = 'user3';
        const facehuntId = 'facehunt3';

        const createdLike = await likeService.create({
            author: userId,
            facehunt: facehuntId,
        });

        const fetchedLike = await likeService.getLikeByAuthorAndFacehunt(userId, facehuntId);

        expect(fetchedLike).toBeDefined();
        expect(fetchedLike.author).toBe(userId);
        expect(fetchedLike.facehunt).toBe(facehuntId);
    });

    it('should throw NotFoundException if like does not exist', async () => {
        const userId = 'nonexistentUser';
        const facehuntId = 'nonexistentFacehunt';

        await expect(
            likeService.getLikeByAuthorAndFacehunt(userId, facehuntId),
        ).rejects.toThrow('Like not found');
    });
})
