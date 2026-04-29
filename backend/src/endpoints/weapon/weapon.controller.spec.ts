import { Test, TestingModule } from '@nestjs/testing';
import { WeaponController } from './weapon.controller';
import { WeaponService } from './weapon.service';
import { NotFoundException } from '@nestjs/common';

describe('WeaponController', () => {
  let controller: WeaponController;
  let weaponService: jest.Mocked<WeaponService>;

  beforeEach(async () => {
    weaponService = {
      findById: jest.fn(),
      getAll: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeaponController],
      providers: [
        { provide: WeaponService, useValue: weaponService },
      ],
    }).compile();

    controller = module.get<WeaponController>(WeaponController);
  });

  describe('getWeapon', () => {
    it('should return a weapon if found', async () => {
      const mockWeapon = {
        id: 'weapon123',
        name: 'Laser Rifle',
        capacity: 10,
        reloadTime: 2.5,
        zoom: 1.2,
      };

      weaponService.findById.mockResolvedValue(mockWeapon as any);

      const result = await controller.getWeapon('weapon123');
      expect(result).toEqual(mockWeapon);
    });

    it('should throw NotFoundException if weapon is not found', async () => {
      weaponService.findById.mockResolvedValue(null as any);

      await expect(controller.getWeapon('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllWeapons', () => {
    it('should return all weapons', async () => {
      const weapons = [
        { id: 'w1', name: 'Pistol', capacity: 6, reloadTime: 1.5, zoom: 1.0 },
        { id: 'w2', name: 'Shotgun', capacity: 2, reloadTime: 3.0, zoom: 0.8 },
      ];

      weaponService.getAll.mockResolvedValue(weapons as any);

      const result = await controller.getAllWeapons();
      expect(result).toEqual(weapons);
    });
  });
});
