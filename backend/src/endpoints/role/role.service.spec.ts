import { RoleService } from './role.service';
import { RoleModule } from './role.module';
import { disconnectDB, connectToDB } from '../../lib/mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule } from '@nestjs/config';

describe('RoleService', () => {
    let roleService: RoleService;
    let moduleRef: TestingModule;
    let mongod: MongoMemoryServer;

    beforeAll(async () => { 
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                MongooseModule.forRoot(uri),
                RoleModule,
            ],
        }).compile();

        roleService = moduleRef.get<RoleService>(RoleService);
    })

    afterEach(async () => {
        await roleService.deleteAll();
    })

    afterAll(async () => {
        await disconnectDB();
        await mongod.stop();
    })

    it('should create a role', async () => {
        const role = await roleService.create({
            baseHP: 120,
            name: 'testRole',
        });

        expect(role.name).toBe('testRole');
        expect(role.baseHP).toBe(120);
    })

    it('should throw NotFoundException for role', async () => {
        const invalidID = 'randomID1234';
        await expect(
            roleService.findById(invalidID)
        ).rejects.toThrow('Invalid ID format');
    })

    it('should delete role', async () => {
        const role = await roleService.create({
            baseHP: 120,
            name: 'testRole',
        })

        await roleService.delete(role.id);
        await expect(
            roleService.findById(role.id)
        ).rejects.toThrow(`Role with id ${role.id} not found`);
    })

    it('should update a role', async () => {
        const role = await roleService.create({
            name: 'testRole',
            baseHP: 100,
        });

        const updated = await roleService.update(role.id, {
            baseHP: 150,
        });

        expect(updated.baseHP).toBe(150);
        expect(updated.name).toBe('testRole');
    })

    it('should return all roles', async () => {
        const role1 = await roleService.create({
            baseHP: 100,
            name: 'RoleOne',
        });

        const role2 = await roleService.create({
            baseHP: 150,
            name: 'RoleTwo',
        });
        
        const roles = await roleService.getAll();

        expect(roles.length).toBe(2);
        expect(roles.map(b => b.name)).toEqual(expect.arrayContaining(['RoleOne', 'RoleTwo']));
    });
})
