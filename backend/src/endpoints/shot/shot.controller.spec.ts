import { Test, TestingModule } from '@nestjs/testing';
import { ShotController } from './shot.controller';
import { ShotService } from './shot.service';
import { GameService } from '../game/game.service';
import { JwtHttpGuard } from './jwt-http.guard';
import { ExecutionContext } from '@nestjs/common';

describe('ShotController', () => {
  let controller: ShotController;
  let shotService: Partial<ShotService>;
  let gameService: Partial<GameService>;

  beforeEach(async () => {
    shotService = {
      getGameShots: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };
    gameService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShotController],
      providers: [
        { provide: ShotService, useValue: shotService },
        { provide: GameService, useValue: gameService },
      ],
    })
      // Mock JwtHttpGuard to always allow
      .overrideGuard(JwtHttpGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
             req.user = { id: 'test-user-id' };
             return true;
        },
      })
      .compile();

    controller = module.get<ShotController>(ShotController);
  });

  describe('getShots', () => {
    it('should return shots when player is in game', async () => {
      const gameId = 'gameId123';
      const playerId = 'playerId123';

      const req = { user: { id: playerId } } as any;

      const game = { players: [playerId] };
      (gameService.findById as jest.Mock).mockResolvedValue(game);
      (shotService.getGameShots as jest.Mock).mockResolvedValue(['shot1', 'shot2']);

      const shots = await controller.getShots(gameId, req);

      expect(gameService.findById).toHaveBeenCalledWith(gameId);
      expect(shotService.getGameShots).toHaveBeenCalledWith(gameId);
      expect(shots).toEqual(['shot1', 'shot2']);
    });

    it('should throw if game not found', async () => {
      (gameService.findById as jest.Mock).mockResolvedValue(null);
      await expect(controller.getShots('gameId', { player: { id: 'p' } } as any)).rejects.toThrow();
    });

    it('should throw if player not in game', async () => {
      const game = { players: ['otherPlayer'] };
      (gameService.findById as jest.Mock).mockResolvedValue(game);
      await expect(controller.getShots('gameId', { player: { id: 'p' } } as any)).rejects.toThrow();
    });
  });
});
