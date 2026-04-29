import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PlayerService } from '../player/player.service';
import { UserService } from '../user/user.service';
import { GamemodeService } from '../gamemode/gamemode.service';
import { JwtService } from '@nestjs/jwt';
import { getConnectionToken } from '@nestjs/mongoose';
import { NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('GameController', () => {
  let controller: GameController;
  let gameService: any;
  let playerService: any;
  let userService: any;
  let gamemodeService: any;
  let jwtService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [
        {
          provide: GameService,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            addPlayer: jest.fn(),
          },
        },
        {
          provide: PlayerService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: GamemodeService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
            sign: jest.fn(),
          },
        },
        {
          provide: getConnectionToken(),
          useValue: {}, // Mocked mongoose connection
        },
      ],
    }).compile();

    controller = module.get<GameController>(GameController);
    gameService = module.get(GameService);
    playerService = module.get(PlayerService);
    userService = module.get(UserService);
    gamemodeService = module.get(GamemodeService);
    jwtService = module.get(JwtService);
  });

  describe('createGame', () => {
    it('should create a game if gamemode exists', async () => {
      const dto = { identifier: 'abc', gameType: 'mode1' };
      gamemodeService.findById.mockReturnValue({ id: 'mode1' });
      gameService.create.mockResolvedValue({ id: 'game1', ...dto });

      const result = await controller.createGame(dto);
      expect(result).toEqual({ id: 'game1', ...dto });
      expect(gameService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw NotFoundException if gamemode not found', async () => {
      const dto = { identifier: 'abc', gameType: 'invalid' };
      gamemodeService.findById.mockReturnValue(null);

      await expect(controller.createGame(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('joinGame', () => {
    const mockReq = (token?: string) => ({
      headers: {
        authorization: token ? `Bearer ${token}` : undefined,
      },
    }) as any;

    it('should allow a guest to join an existing game', async () => {
      const gameId = 'game1';
      const game = { id: gameId, ended: false };
      gameService.findById.mockResolvedValue(game);

      const player = { id: 'player1', credits: 100 };
      playerService.create.mockResolvedValue(player);
      gameService.addPlayer.mockResolvedValue(undefined);
      jwtService.sign.mockReturnValue('player-token');

      const result = await controller.joinGame(gameId, mockReq());
      expect(result).toEqual({
        player,
        token: 'player-token',
        credits: 100,
      });
    });

    it('should allow a registered user to join', async () => {
      const gameId = 'game1';
      const userId = 'user123';
      const token = 'valid.token';

      jwtService.verify.mockReturnValue({ id: userId });
      gameService.findById.mockResolvedValue({ id: gameId, ended: false });
      userService.findById.mockResolvedValue({ id: userId, credits: 300 });

      const player = { id: 'player1', credits: 300 };
      playerService.create.mockResolvedValue(player);
      gameService.addPlayer.mockResolvedValue(undefined);
      jwtService.sign.mockReturnValue('player-token');

      const result = await controller.joinGame(gameId, mockReq(token));
      expect(result).toEqual({
        player,
        token: 'player-token',
        credits: 300,
      });
    });

    it('should throw UnauthorizedException on invalid token', async () => {
      jwtService.verify.mockImplementation(() => { throw new Error(); });
      await expect(controller.joinGame('game1', mockReq('bad.token'))).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if game does not exist', async () => {
      gameService.findById.mockResolvedValue(null);
      await expect(controller.joinGame('game404', mockReq())).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if game already ended', async () => {
      gameService.findById.mockResolvedValue({ id: 'game1', ended: true });
      await expect(controller.joinGame('game1', mockReq())).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user ID is invalid', async () => {
      jwtService.verify.mockReturnValue({ id: 'user123' });
      gameService.findById.mockResolvedValue({ id: 'game1', ended: false });
      userService.findById.mockResolvedValue(null);

      await expect(controller.joinGame('game1', mockReq('valid.token'))).rejects.toThrow(NotFoundException);
    });
  });
});
