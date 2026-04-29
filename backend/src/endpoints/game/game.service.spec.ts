import { GameService } from './game.service';
import { GameModule } from './game.module';
import { disconnectDB, connectToDB } from '../../lib/mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule } from '@nestjs/config';
import { Types } from 'mongoose';

describe('GameService', () => {
    let gameService: GameService;
    let moduleRef: TestingModule;
    let mongod: MongoMemoryServer;

    beforeAll(async () => { 
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                MongooseModule.forRoot(uri),
                GameModule,
            ],
        }).compile();

        gameService = moduleRef.get<GameService>(GameService);
    })

    afterEach(async () => {
        await gameService.deleteAll();
    })

    afterAll(async () => {
        await disconnectDB();
        await mongod.stop();
    })

    it('should create a game', async () => {
        const game = await gameService.create({
            identifier: 'testGame',
            gameType: 'gameType',
        });

        expect(game.identifier).toBe('testGame');
        expect(game.gameType).toBe('gameType');
    })

    it('should throw NotFoundException for game', async () => {
        const invalidID = 'randomID1234';
        await expect(
            gameService.findById(invalidID)
        ).rejects.toThrow('Invalid ID format');
    })

    it('should delete game', async () => {
        const game = await gameService.create({
            identifier: 'testGame',
            gameType: 'gameType',
        })

        await gameService.delete(game.id);
        await expect(
            gameService.findById(game.id)
        ).rejects.toThrow(`Game with id ${game.id} not found`);
    })

    it('should update a game', async () => {
        const game = await gameService.create({
            identifier: 'testGame',
            gameType: 'gameType',
        });

        const updated = await gameService.update(game.id, {
            players: [new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString()]
        });

        expect(updated.players.length).toBe(2);
    })

    it('should return all games', async () => {
        const game1 = await gameService.create({
            identifier: 'testGame',
            gameType: 'gameType',
        });

        const game2 = await gameService.create({
            identifier: 'testGame1',
            gameType: 'gameType1',
        });
        
        const games = await gameService.getAll();

        expect(games.length).toBe(2);
    });

    it('should add a player to a game', async () => {
        const game = await gameService.create({
            identifier: 'testGame',
            gameType: 'default',
        });

        const playerId = new Types.ObjectId().toHexString();

        const updated = await gameService.addPlayer(game.id, playerId);

        expect(updated.players.length).toBe(1);
        expect(updated.players[0].toString()).toBe(playerId);
    });

    it('should not add duplicate players', async () => {
        const playerId = new Types.ObjectId().toHexString();

        const game = await gameService.create({
            identifier: 'testGame',
            gameType: 'default',
        });

        const updated = await gameService.addPlayer(game.id, playerId);
        const updated2 = await gameService.addPlayer(game.id, playerId);

        expect(updated2.players.length).toBe(1);
    });

    it('should throw if game not found', async () => {
        await expect(
          gameService.addPlayer(new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString())
        ).rejects.toThrow('Game not found');
    });
})
