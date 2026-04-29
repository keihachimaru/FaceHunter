import { PlayerService } from './player.service';
import { PlayerModule } from './player.module';
import { disconnectDB, connectToDB } from '../../lib/mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule } from '@nestjs/config';
import { Types } from 'mongoose';

describe('PlayerService', () => {
    let playerService: PlayerService;
    let moduleRef: TestingModule;
    let mongod: MongoMemoryServer;

    beforeAll(async () => { 
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                MongooseModule.forRoot(uri),
                PlayerModule,
            ],
        }).compile();

        playerService = moduleRef.get<PlayerService>(PlayerService);
    })

    afterEach(async () => {
        await playerService.deleteAll();
    })

    afterAll(async () => {
        await disconnectDB();
        await mongod.stop();
    })

    it('should create a player', async () => {
        const player = await playerService.create({
            user: 'user1',
            game: 'game1',
            weapon: 'weapon1',
            bullets: [new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString()],
            role: 'role1',
            remainingHP: 100,
            credits: 10,
        });

        expect(player.user).toBe('user1');
        expect(player.game).toBe('game1');
        expect(player.weapon).toBe('weapon1');
        expect(player.bullets.length).toBe(3);
        expect(player.role).toBe('role1');
        expect(player.remainingHP).toBe(100);
    })

    it('should throw NotFoundException for player', async () => {
        const invalidID = 'randomID1234';
        await expect(
            playerService.findById(invalidID)
        ).rejects.toThrow('Invalid ID format');
    })

    it('should delete player', async () => {
        const player = await playerService.create({
            user: 'user1',
            game: 'game1',
            weapon: 'weapon1',
            bullets: [new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString()],
            role: 'role1',
            remainingHP: 100,
            credits: 10000,
        })

        await playerService.delete(player.id);
        await expect(
            playerService.findById(player.id)
        ).rejects.toThrow(`Player with id ${player.id} not found`);
    })

    it('should update a player', async () => {
        const player = await playerService.create({
            user: 'user1',
            game: 'game1',
            weapon: 'weapon1',
            bullets: [new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString()],
            role: 'role1',
            remainingHP: 100,
            credits: 100,
        });

        const updated = await playerService.update(player.id, {
            shots: [new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString()],
            bullets: player.bullets.slice(1),
        });

        expect(updated.shots.length).toBe(2);
        expect(updated.bullets.length).toBe(2);
    })

    it('should return all players', async () => {
        const player1 = await playerService.create({
            user: 'user1',
            game: 'game1',
            weapon: 'weapon1',
            bullets: [new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString()],
            role: 'role1',
            remainingHP: 100,
            credits: 10,
        });

        const player2 = await playerService.create({
            game: 'game1',
            weapon: 'weapon2',
            bullets: [new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString()],
            role: 'role2',
            remainingHP: 150,
            credits: 1000,
        });
        
        const players = await playerService.getAll();

        expect(players.length).toBe(2);
    })
})
