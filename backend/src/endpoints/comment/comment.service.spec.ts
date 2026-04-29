import { CommentService } from './comment.service';
import { CommentModule } from './comment.module';
import { disconnectDB, connectToDB } from '../../lib/mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule } from '@nestjs/config';

describe('CommentService', () => {
    let commentService: CommentService;
    let moduleRef: TestingModule;
    let mongod: MongoMemoryServer;

    beforeAll(async () => { 
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                MongooseModule.forRoot(uri),
                CommentModule,
            ],
        }).compile();

        commentService = moduleRef.get<CommentService>(CommentService);
    })

    afterEach(async () => {
        await commentService.deleteAll();
    })

    afterAll(async () => {
        await disconnectDB();
        await mongod.stop();
    })

    it('should create a comment', async () => {
        const comment = await commentService.create({
            content: 'testComment',
            author: 'commentAuthor1',
            facehunt: 'commentGame1',
        });

        expect(comment.content).toBe('testComment');
    })

    it('should throw NotFoundException for comment', async () => {
        const invalidID = 'randomID1234';
        await expect(
            commentService.findById(invalidID)
        ).rejects.toThrow('Invalid ID format');
    })

    it('should delete comment', async () => {
        const comment = await commentService.create({
            content: 'testComment',
            author: 'commentAuthor1',
            facehunt: 'commentGame1',
        })

        await commentService.delete(comment.id);
        await expect(
            commentService.findById(comment.id)
        ).rejects.toThrow(`Comment with id ${comment.id} not found`);
    })

    it('should update a comment', async () => {
        const comment = await commentService.create({
            content: 'testComment',
            author: 'commentAuthor1',
            facehunt: 'commentFacehunt1',
        });

        const updated = await commentService.update(comment.id, {
            content: 'newTestComment',
        });

        expect(updated.content).toBe('newTestComment');
    })

    it('should return all comments', async () => {
        const comment1 = await commentService.create({
            content: 'CommentOne',
            author: 'commentAuthor1',
            facehunt: 'commentGame1',
        });

        const comment2 = await commentService.create({
            content: 'CommentTwo',
            author: 'commentAuthor1',
            facehunt: 'commentGame1',
        });
        
        const comments = await commentService.getAll();

        expect(comments.length).toBe(2);
        expect(comments.map(b => b.content)).toEqual(expect.arrayContaining(['CommentOne', 'CommentTwo']));
    });
})


