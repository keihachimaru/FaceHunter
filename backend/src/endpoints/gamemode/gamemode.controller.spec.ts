import { Test, TestingModule } from '@nestjs/testing';
import { GamemodeController } from './gamemode.controller';
import { GamemodeService } from './gamemode.service';
import { NotFoundException } from '@nestjs/common';

describe('GamemodeController', () => {
  let controller: GamemodeController;
  let gamemodeService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamemodeController],
      providers: [
        {
          provide: GamemodeService,
          useValue: {
            findById: jest.fn(),
            getAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GamemodeController>(GamemodeController);
    gamemodeService = module.get<GamemodeService>(GamemodeService);
  });

  describe('getGamemode', () => {
    it('should return gamemode if found', async () => {
      const mockGamemode = {
        id: 'abc123',
        name: 'Deathmatch',
        numRounds: 5,
        roundLength: 60,
      };

      gamemodeService.findById.mockResolvedValue(mockGamemode);

      const result = await controller.getGamemode('abc123');
      expect(result).toEqual(mockGamemode);
      expect(gamemodeService.findById).toHaveBeenCalledWith('abc123');
    });

    it('should throw NotFoundException if gamemode not found', async () => {
      gamemodeService.findById.mockResolvedValue(null);

      await expect(controller.getGamemode('404')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllGamemodes', () => {
    it('should return all gamemodes', async () => {
      const mockGamemodes = [
        { id: '1', name: 'Team Deathmatch' },
        { id: '2', name: 'Capture the Flag' },
      ];

      gamemodeService.getAll.mockResolvedValue(mockGamemodes);

      const result = await controller.getAllGamemodes();
      expect(result).toEqual(mockGamemodes);
      expect(gamemodeService.getAll).toHaveBeenCalled();
    });
  });
});
