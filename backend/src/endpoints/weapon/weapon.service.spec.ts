import { WeaponService } from './weapon.service';
import { WeaponModule } from './weapon.module';
import { disconnectDB, connectToDB } from '../../lib/mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule } from '@nestjs/config';
import { Types } from 'mongoose';

describe('WeaponService', () => {
    let weaponService: WeaponService;
    let moduleRef: TestingModule;
    let mongod: MongoMemoryServer;

    beforeAll(async () => { 
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                MongooseModule.forRoot(uri),
                WeaponModule,
            ],
        }).compile();

        weaponService = moduleRef.get<WeaponService>(WeaponService);
    })

    afterEach(async () => {
        await weaponService.deleteAll();
    })

    afterAll(async () => {
        await disconnectDB();
        await mongod.stop();
    })

    it('should create a weapon', async () => {
        const weapon = await weaponService.create({
            name: 'weapon1',
            capacity: 10,
            reloadTime: 1.5,
            zoom: 1.2,
            sound: 'sound1',
        });

        expect(weapon.name).toBe('weapon1');
        expect(weapon.capacity).toBe(10);
        expect(weapon.reloadTime).toBe(1.5);
        expect(weapon.zoom).toBe(1.2);
        expect(weapon.sound).toBe('sound1');
    })

    it('should throw NotFoundException for weapon', async () => {
        const invalidID = 'randomID1234';
        await expect(
            weaponService.findById(invalidID)
        ).rejects.toThrow('Invalid ID format');
    })

    it('should delete weapon', async () => {
        const weapon = await weaponService.create({
            name: 'weapon1',
            capacity: 10,
            reloadTime: 1.5,
            zoom: 1.2,
            sound: 'sound1',
        })

        await weaponService.delete(weapon.id);
        await expect(
            weaponService.findById(weapon.id)
        ).rejects.toThrow(`Weapon with id ${weapon.id} not found`);
    })

    it('should update a weapon', async () => {
        const weapon = await weaponService.create({
            name: 'weapon1',
            capacity: 10,
            reloadTime: 1.5,
            zoom: 1.2,
            sound: 'sound1',
        });

        const updated = await weaponService.update(weapon.id, {
            zoom: 10,
            skin: 'skin1',
        });

        expect(updated.zoom).toBe(10);
        expect(updated.skin).toBe('skin1');
    })

    it('should return all weapons', async () => {
        const weapon1 = await weaponService.create({
            name: 'weapon1',
            capacity: 10,
            reloadTime: 1.5,
            zoom: 1.2,
            sound: 'sound1',
        });

        const weapon2 = await weaponService.create({
            name: 'weapon2',
            capacity: 10,
            reloadTime: 1.5,
            zoom: 1.2,
            sound: 'sound1',
        });
        
        const weapons = await weaponService.getAll();

        expect(weapons.length).toBe(2);
    })
})
