
import { FacehuntService } from './facehunt.service';
import { FacehuntModule } from './facehunt.module';
import { disconnectDB, connectToDB } from '../../lib/mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule } from '@nestjs/config';

describe('FacehuntService', () => {
    let facehuntService: FacehuntService;
    let moduleRef: TestingModule;
    let mongod: MongoMemoryServer;

    beforeAll(async () => { 
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                MongooseModule.forRoot(uri),
                FacehuntModule,
            ],
        }).compile();

        facehuntService = moduleRef.get<FacehuntService>(FacehuntService);
    })

    afterEach(async () => {
        await facehuntService.deleteAll();
    })

    afterAll(async () => {
        await disconnectDB();
        await mongod.stop();
    })

    it('should create a facehunt', async () => {
        const facehunt = await facehuntService.create({
            name: 'testFacehunt',
            author: 'facehuntAuthor',
            game: 'facehuntGame',
            image: 'facehuntImage'
        });

        expect(facehunt.name).toBe('testFacehunt');
        expect(facehunt.author).toBe('facehuntAuthor');
        expect(facehunt.game).toBe('facehuntGame');
        expect(facehunt.image).toBe('facehuntImage');
    })

    it('should throw NotFoundException for facehunt', async () => {
        const invalidID = 'randomID1234';
        await expect(
            facehuntService.findById(invalidID)
        ).rejects.toThrow('Invalid ID format');
    })

    it('should delete facehunt', async () => {
        const facehunt = await facehuntService.create({
            name: 'testFacehunt',
            author: 'facehuntAuthor',
            game: 'facehuntGame',
            image: 'facehuntImage'
        })

        await facehuntService.delete(facehunt.id);
        await expect(
            facehuntService.findById(facehunt.id)
        ).rejects.toThrow(`Facehunt with id ${facehunt.id} not found`);
    })

    it('should update a facehunt', async () => {
        const facehunt = await facehuntService.create({
            name: 'testFacehunt',
            author: 'facehuntAuthor',
            game: 'facehuntGame',
            image: 'facehuntImage'
        });

        const updated = await facehuntService.update(facehunt.id, {
            name: 'newTestFacehunt',
        });

        expect(updated.name).toBe('newTestFacehunt');
    })

    it('should return all facehunts', async () => {
        const facehunt1 = await facehuntService.create({
            name: 'FacehuntOne',
            author: 'facehuntAuthor',
            game: 'facehuntGame',
            image: 'facehuntImage'
        });

        const facehunt2 = await facehuntService.create({
            name: 'FacehuntTwo',
            author: 'facehuntAuthor1',
            game: 'facehuntGame1',
            image: 'facehuntImage1'
        });
        
        const facehunts = await facehuntService.getAll(0, 10);

        expect(facehunts.length).toBe(2);
        expect(facehunts.map(b => b.name)).toEqual(expect.arrayContaining(['FacehuntOne', 'FacehuntTwo']));
    });
})


