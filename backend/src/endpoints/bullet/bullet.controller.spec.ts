import { Test, TestingModule } from '@nestjs/testing';
import { BulletController } from './bullet.controller';
import { BulletService } from './bullet.service';
import { getConnectionToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Connection } from 'mongoose';

describe('BulletController', () => {
  let controller: BulletController;
  let bulletService: Partial<Record<keyof BulletService, jest.Mock>>;
  let connection: Partial<Connection>;

  beforeEach(async () => {
    bulletService = {
      findById: jest.fn(),
      getAll: jest.fn(),
    };

    connection = {
      // Not used in this controller currently, but mocked for compatibility
      startSession: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BulletController],
      providers: [
        { provide: BulletService, useValue: bulletService },
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();

    controller = module.get<BulletController>(BulletController);
  });

  describe('getBullet', () => {
    it('should return a bullet when found', async () => {
      const bulletMock = {
        _id: 'bullet123',
        name: 'Armor Piercing',
        damage: 50,
      };

      bulletService.findById!.mockResolvedValue(bulletMock);

      const result = await controller.getBullet('bullet123');

      expect(bulletService.findById).toHaveBeenCalledWith('bullet123');
      expect(result).toEqual(bulletMock);
    });

    it('should throw NotFoundException if bullet not found', async () => {
      bulletService.findById!.mockResolvedValue(null);

      await expect(controller.getBullet('missingId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllBullets', () => {
    it('should return all bullets', async () => {
      const bulletList = [
        { _id: '1', name: 'Fire Bullet', damage: 30 },
        { _id: '2', name: 'Ice Bullet', damage: 20 },
      ];

      bulletService.getAll!.mockResolvedValue(bulletList);

      const result = await controller.getAllBullets();

      expect(bulletService.getAll).toHaveBeenCalled();
      expect(result).toEqual(bulletList);
    });
  });
});
