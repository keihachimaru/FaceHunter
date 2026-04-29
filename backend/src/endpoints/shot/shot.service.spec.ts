import { ShotService } from './shot.service';
import { ShotModule } from './shot.module';
import { disconnectDB, connectToDB } from '../../lib/mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule } from '@nestjs/config';
import { Types } from 'mongoose';

describe('ShotService', () => {
    let shotService: ShotService;
    let moduleRef: TestingModule;
    let mongod: MongoMemoryServer;

    beforeAll(async () => { 
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                MongooseModule.forRoot(uri),
                ShotModule,
            ],
        }).compile();

        shotService = moduleRef.get<ShotService>(ShotService);
    })

    afterEach(async () => {
        jest.restoreAllMocks();  // restore any mocks after each test
        await shotService.deleteAll();
    })

    afterAll(async () => {
        await disconnectDB();
        await mongod.stop();
    })

    it('should create a shot with mocked validation', async () => {
        // Mock validateImage to always return true
        jest.spyOn(shotService as any, 'validateImage').mockResolvedValue(true);

        const shot = await shotService.create({
            valid: false,  // initial value will be overwritten in create()
            author: 'user1',
            target: 'user2',
            game: 'game1',
        }, Buffer.from('fake-image-data'));

        expect(shot.valid).toBe(true);
        expect(shot.author).toBe('user1');
        expect(shot.target).toBe('user2');
        expect(shot.game).toBe('game1');
    })

    it('should throw BadRequestException for invalid ID format', async () => {
        const invalidID = 'randomID1234';
        await expect(
            shotService.findById(invalidID)
        ).rejects.toThrow('Invalid ID format');
    })

    it('should delete shot', async () => {
        jest.spyOn(shotService as any, 'validateImage').mockResolvedValue(true);

        const shot = await shotService.create({
            valid: false,
            author: 'user1',
            target: 'user2',
            game: 'game1',
        }, Buffer.from('fake-image-data'))

        await shotService.delete(shot.id);
        await expect(
            shotService.findById(shot.id)
        ).rejects.toThrow(`Shot with id ${shot.id} not found`);
    })

    it('should update a shot', async () => {
        jest.spyOn(shotService as any, 'validateImage').mockResolvedValue(true);

        const shot = await shotService.create({
            valid: false,
            author: 'user1',
            target: 'user2',
            game: 'game1',
        }, Buffer.from('fake-image-data'));

        const updated = await shotService.update(shot.id, {
            votes: 10,
        });

        expect(updated.votes).toBe(10);
    })

    it('should return all shots', async () => {
        jest.spyOn(shotService as any, 'validateImage').mockResolvedValue(true);

        const shot1 = await shotService.create({
            valid: false,
            author: 'user1',
            target: 'user2',
            game: 'game1',
        }, Buffer.from('fake-image-data'));

        const shot2 = await shotService.create({
            valid: false,
            author: 'user2',
            target: 'user1',
            game: 'game1',
        }, Buffer.from('fake-image-data'));
        
        const shots = await shotService.getAll();

        expect(shots.length).toBe(2);
    })
    it('should return all shots for a specific game', async () => {
        jest.spyOn(shotService as any, 'validateImage').mockResolvedValue(true);

        // Create shots for game1 and game2
        await shotService.create({
            valid: false,
            author: 'user1',
            target: 'user2',
            game: 'game1',
        }, Buffer.from('image-1'));

        await shotService.create({
            valid: false,
            author: 'user3',
            target: 'user4',
            game: 'game2',
        }, Buffer.from('image-2'));

        await shotService.create({
            valid: false,
            author: 'user5',
            target: 'user6',
            game: 'game1',
        }, Buffer.from('image-3'));

        // Fetch only shots from game1
        const game1Shots = await shotService.getGameShots('game1');

        expect(game1Shots).toHaveLength(2);
        expect(game1Shots.every(s => s.game === 'game1')).toBe(true);
    });
})
