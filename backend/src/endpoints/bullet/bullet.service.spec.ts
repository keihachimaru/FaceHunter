import { BulletService } from './bullet.service';
import { BulletModule } from './bullet.module';
import { disconnectDB, connectToDB } from '../../lib/mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule } from '@nestjs/config';

describe('BulletService', () => {
    let bulletService: BulletService;
    let moduleRef: TestingModule;
    let mongod: MongoMemoryServer;

    beforeAll(async () => { 
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                MongooseModule.forRoot(uri),
                BulletModule,
            ],
        }).compile();

        bulletService = moduleRef.get<BulletService>(BulletService);
    })

    afterEach(async () => {
        await bulletService.deleteAll();
    })

    afterAll(async () => {
        await disconnectDB();
        await mongod.stop();
    })

    it('should create a bullet', async () => {
        const bullet = await bulletService.create({
            price: 10.5,
            dmgMul: 1.5,
            name: 'testBullet',
        });

        expect(bullet.name).toBe('testBullet');
        expect(bullet.dmgMul).toBe(1.5);
        expect(bullet.name).toBe('testBullet');
    })

    it('should throw NotFoundException for bullet', async () => {
        const invalidID = 'randomID1234';
        await expect(
            bulletService.findById(invalidID)
        ).rejects.toThrow('Invalid ID format');
    })

    it('should delete bullet', async () => {
        const bullet = await bulletService.create({
            price: 10.5,
            dmgMul: 1.5,
            name: 'testBullet',
        })

        await bulletService.delete(bullet.id);
        await expect(
            bulletService.findById(bullet.id)
        ).rejects.toThrow(`Bullet with id ${bullet.id} not found`);
    })

    it('should update a bullet', async () => {
        const bullet = await bulletService.create({
            price: 10.5,
            dmgMul: 1.5,
            name: 'testBullet',
        });

        const updated = await bulletService.update(bullet.id, {
            dmgMul: 2.0,
            price: 15.0,
        });

        expect(updated.dmgMul).toBe(2.0);
        expect(updated.name).toBe('testBullet');
    })

    it('should return all bullets', async () => {
        const bullet1 = await bulletService.create({
            price: 10,
            dmgMul: 1.2,
            name: 'BulletOne',
        });

        const bullet2 = await bulletService.create({
            price: 15,
            dmgMul: 1.5,
            name: 'BulletTwo',
        });
        
        const bullets = await bulletService.getAll();

        expect(bullets.length).toBe(2);
        expect(bullets.map(b => b.name)).toEqual(expect.arrayContaining(['BulletOne', 'BulletTwo']));
    });
})
