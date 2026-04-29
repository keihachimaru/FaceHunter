import { Test, TestingModule } from '@nestjs/testing';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { BulletService } from '../bullet/bullet.service';
import { WeaponService } from '../weapon/weapon.service';
import { JwtPlayerAuthGuard } from './jwt-player-auth.guard';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PlayerController', () => {
  let controller: PlayerController;
  let playerService: jest.Mocked<PlayerService>;
  let bulletService: jest.Mocked<BulletService>;
  let weaponService: jest.Mocked<WeaponService>;

  const mockPlayerId = 'player123';
  const mockReq = { player: { id: mockPlayerId } } as any;

  beforeEach(async () => {
    playerService = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    bulletService = {
      findById: jest.fn(),
    } as any;

    weaponService = {
      findById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerController],
      providers: [
        { provide: PlayerService, useValue: playerService },
        { provide: BulletService, useValue: bulletService },
        { provide: WeaponService, useValue: weaponService },
      ],
    })
      .overrideGuard(JwtPlayerAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PlayerController>(PlayerController);
  });

  describe('getOwnPlayer', () => {
    it('should return player if found', async () => {
      const mockPlayer = { id: mockPlayerId };
      playerService.findById.mockResolvedValue(mockPlayer as any);

      const result = await controller.getOwnPlayer(mockReq);
      expect(result).toEqual(mockPlayer);
    });

    it('should throw NotFoundException if player not found', async () => {
      playerService.findById.mockResolvedValue(null as any);

      await expect(controller.getOwnPlayer(mockReq)).rejects.toThrow(NotFoundException);
    });
  });

  describe('buyBullets', () => {
    it('should update player bullets and credits correctly', async () => {
      const dto = { buy: ['b1'], sell: ['b2'] };
      const bulletPrices = { b1: 10, b2: 20 };

      const player = {
        id: mockPlayerId,
        bullets: ['b2'],
        credits: 15,
      };

      bulletService.findById.mockImplementation((id: string) =>
        Promise.resolve({ price: bulletPrices[id] } as any)
      );

      playerService.findById.mockResolvedValue({ ...player } as any);
      playerService.update.mockResolvedValue(true as any);

      await controller.buyBullets(mockReq, dto);

      expect(playerService.update).toHaveBeenCalledWith(mockPlayerId, {
        bullets: ['b1'],
        credits: 25,
      });
    });

    it('should throw if balance is negative', async () => {
      const dto = { buy: ['b1'], sell: [] };

      bulletService.findById.mockResolvedValue({ price: 100 } as any);
      playerService.findById.mockResolvedValue({
        bullets: [],
        credits: 10,
      } as any);

      await expect(controller.buyBullets(mockReq, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if trying to sell unavailable bullet', async () => {
      const dto = { buy: [], sell: ['b2'] };

      bulletService.findById.mockResolvedValue({ price: 10 } as any);
      playerService.findById.mockResolvedValue({
        bullets: [],
        credits: 100,
      } as any);

      await expect(controller.buyBullets(mockReq, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleShot', () => {
    beforeEach(() => {
      (global as any).gamemode = 'standard';
    });

    it('should deal damage in standard mode', async () => {
      const dto = { valid: true, bullet: 'b1', weapon: 'w1', target: 'enemy', gamemode: 'gm1' };
      const player = { remainingHP: 100 };
      const bullet = { dmgMul: 20 };

      playerService.findById.mockResolvedValue(player as any);
      bulletService.findById.mockResolvedValue(bullet as any);
      playerService.update.mockResolvedValue({ remainingHP: 80 } as any);

      const result = await controller.handleShot(mockReq, dto);
      expect(result).toEqual({ remainingHP: 80 });
    });

    it('should set HP to 0 in faceMatch mode', async () => {
      (global as any).gamemode = 'faceMatch';

      const dto = { valid: true, bullet: 'b1', weapon: 'w1', target: 'enemy', gamemode: 'gm1' };
      const player = { remainingHP: 100 };
      const bullet = { dmgMul: 50 };

      playerService.findById.mockResolvedValue(player as any);
      bulletService.findById.mockResolvedValue(bullet as any);
      playerService.update.mockResolvedValue({ remainingHP: 0 } as any);

      const result = await controller.handleShot(mockReq, dto);
      expect(result).toEqual({ remainingHP: 0 });
    });

    it('should throw if bullet is not found', async () => {
      const dto = { valid: true, bullet: 'b1', weapon: 'w1', target: 'enemy', gamemode: 'gm1' };

      bulletService.findById.mockResolvedValue(null as any);

      await expect(controller.handleShot(mockReq, dto)).rejects.toThrow(NotFoundException);
    });
  });
});
