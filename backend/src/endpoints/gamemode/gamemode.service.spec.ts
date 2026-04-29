import { GamemodeService } from './gamemode.service';
import { GamemodeModule } from './gamemode.module';
import { disconnectDB, connectToDB } from '../../lib/mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule } from '@nestjs/config';
import { Types } from 'mongoose';

describe('GamemodeService', () => {
    let gamemodeService: GamemodeService;
    let moduleRef: TestingModule;
    let mongod: MongoMemoryServer;

    beforeAll(async () => { 
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                MongooseModule.forRoot(uri),
                GamemodeModule,
            ],
        }).compile();

        gamemodeService = moduleRef.get<GamemodeService>(GamemodeService);
    })

    afterEach(async () => {
        await gamemodeService.deleteAll();
    })

    afterAll(async () => {
        await disconnectDB();
        await mongod.stop();
    })

    it('should create a gamemode', async () => {
        const gamemode = await gamemodeService.create({
            name: 'testGamemode',
            numRounds: 1,
            roundLength: 90,
            teams: false,
            teamLimit: 0,
        });

        expect(gamemode.name).toBe('testGamemode');
        expect(gamemode.numRounds).toBe(1);
        expect(gamemode.roundLength).toBe(90);
        expect(gamemode.teams).toBe(false);
        expect(gamemode.teamLimit).toBe(0);
    })

    it('should throw NotFoundException for gamemode', async () => {
        const invalidID = 'randomID1234';
        await expect(
            gamemodeService.findById(invalidID)
        ).rejects.toThrow('Invalid ID format');
    })

    it('should delete gamemode', async () => {
        const gamemode = await gamemodeService.create({
            name: 'testGamemode',
            numRounds: 1,
            roundLength: 90,
            teams: false,
            teamLimit: 0,
        })

        await gamemodeService.delete(gamemode.id);
        await expect(
            gamemodeService.findById(gamemode.id)
        ).rejects.toThrow(`Gamemode with id ${gamemode.id} not found`);
    })

    it('should update a gamemode', async () => {
        const gamemode = await gamemodeService.create({
            name: 'testGamemode',
            numRounds: 1,
            roundLength: 90,
            teams: false,
            teamLimit: 0,
        });

        const updated = await gamemodeService.update(gamemode.id, {
            numRounds: 10,
            teams: true,
            teamLimit: 2,
        });

        expect(updated.numRounds).toBe(10);
        expect(updated.teams).toBe(true);
        expect(updated.teamLimit).toBe(2);
    })

    it('should return all gamemodes', async () => {
        const gamemode1 = await gamemodeService.create({
            name: 'testGamemode1',
            numRounds: 1,
            roundLength: 90,
            teams: false,
            teamLimit: 0,
        });

        const gamemode2 = await gamemodeService.create({
            name: 'testGamemode2',
            numRounds: 1,
            roundLength: 90,
            teams: false,
            teamLimit: 0,
        });
        
        const gamemodes = await gamemodeService.getAll();

        expect(gamemodes.length).toBe(2);
    })
})
