import { Test, TestingModule } from '@nestjs/testing';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { ShotService } from '../shot/shot.service';
import { FacehuntService } from '../facehunt/facehunt.service';
import { PlayerService } from '../player/player.service';
import { BadRequestException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtModule} from '@nestjs/jwt';

describe('GameGateway', () => {
  let gateway: GameGateway;
  let gameService: Partial<Record<keyof GameService, jest.Mock>>;
  let playerService: Partial<Record<keyof PlayerService, jest.Mock>>;
  let shotService: Partial<Record<keyof ShotService, jest.Mock>>;
  let facehuntService: Partial<Record<keyof FacehuntService, jest.Mock>>;
  let server: Partial<Server>;

  // Mock Socket client
  const createMockSocket = (playerData: any = {}) => {
    return {
      id: 'socket-id',
      data: { player: playerData },
      join: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as Socket;
  };

  const mockAuthor = {
      id: 'player1',
      bullets: ['bullet1', 'bullet2'],
      gameId: 'game1',
  }

  const mockTarget = {
      id: 'target1',
      gameId: 'game1',
  }

  beforeEach(async () => {
    gameService = {
      findById: jest.fn(),
    };
    shotService = {
      create: jest.fn(),
    };
    facehuntService = {
      create: jest.fn(),
    };
    playerService = {
        findById: jest.fn().mockImplementation((id) => {
            if (id === 'player1') return Promise.resolve(mockAuthor);
            if (id === 'target1') return Promise.resolve(mockTarget);
            return Promise.resolve(null);
        }),
    }
    server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
        imports: [
            JwtModule.register({
                secret: 'test-secret',
                signOptions: { expiresIn: '60s' },
            }),
        ],
        providers: [
            GameGateway,
            { provide: GameService, useValue: gameService },
            { provide: ShotService, useValue: shotService },
            { provide: PlayerService, useValue: playerService },
            { provide: FacehuntService, useValue: facehuntService },
        ],
    }).compile();

    gateway = module.get<GameGateway>(GameGateway);
    gateway.server = server as Server;
  });

  describe('afterInit', () => {
    it('should log when initialized', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      gateway.afterInit(server as Server);
      expect(consoleSpy).toHaveBeenCalledWith('Game Gateway initialized');
      consoleSpy.mockRestore();
    });
  });

  describe('handleConnection', () => {
    it('should allow connection for authorized player', async () => {
      const player = { id: 'player1', gameId: 'game1' };
      const client = createMockSocket(player);
      const game = { players: ['player1', 'player2'] };
      (gameService.findById as jest.Mock).mockResolvedValue(game);

      await gateway.handleConnection(client);

      expect(gameService.findById).toHaveBeenCalledWith(player.gameId);
      expect(client.join).toHaveBeenCalledWith(player.gameId);
      expect(server.to).toHaveBeenCalledWith(player.gameId);
      expect(server.emit).toHaveBeenCalledWith('player-joined', { playerId: player.id });
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect unauthorized player', async () => {
      const player = { id: 'intruder', gameId: 'game1' };
      const client = createMockSocket(player);
      const game = { players: ['player1', 'player2'] };
      (gameService.findById as jest.Mock).mockResolvedValue(game);

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        `Unauthorized player intruder tried to connect to game game1`
      );
      consoleWarnSpy.mockRestore();
    });
  });

  describe('handleDisconnect', () => {
    it('should log when client disconnects', () => {
      const client = createMockSocket();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      gateway.handleDisconnect(client);

      expect(consoleSpy).toHaveBeenCalledWith(`Client disconnected: ${client.id}`);
      consoleSpy.mockRestore();
    });
  });

  describe('handleShoot', () => {
    const player = { id: 'player1', gameId: 'game1' };
    const client = createMockSocket(player);
    const dto = {
      valid: true,
      author: 'player1',
      game: 'game1',
      target: 'target1',
    };
    const validImage = Buffer.from('abc');

    it('should throw if image is not a buffer', async () => {
      await expect(
        gateway.handleShoot(client, [dto, 'not-a-buffer' as any, 'bullet1'])
      ).rejects.toThrow(BadRequestException);
    });

    it('should process a valid shot and emit events', async () => {
          // Create a complete mock shot object
          const mockShot = {
            id: 'shot1',
            valid: true,
            target: 'target1',
            author: 'player1',
            game: 'game1',
            image: 'base64-encoded-image',
            createdAt: new Date()
          };
    
          const updatedGame = { id: 'game1', state: 'updated' };
    
          // Setup mocks
          (shotService.create as jest.Mock).mockResolvedValue(mockShot);
          (gameService.findById as jest.Mock).mockResolvedValue(updatedGame);
    
          await gateway.handleShoot(client, [dto, validImage, 'bullet1']);
    
          // Verify service calls
          expect(shotService.create).toHaveBeenCalledWith(dto, validImage);
          
          // Verify emissions
          expect(server.to).toHaveBeenCalledWith(player.gameId);
          expect(server.emit).toHaveBeenCalledWith('shot-fired', expect.objectContaining({
            valid: true,
            target: 'target1',
            bullet: 'bullet1'
          }));
          expect(server.emit).toHaveBeenCalledWith('game-state', updatedGame);
        });
    
    // Add this new test case
    it('should throw if bullet is not in player inventory', async () => {
      await expect(
        gateway.handleShoot(client, [dto, validImage, 'invalid-bullet'])
      ).rejects.toThrow(BadRequestException);
    });
  });

    describe('handleVotingDone', () => {
      const player = { id: 'player1', gameId: 'game1' };
      const client = createMockSocket(player);
      const mockGame = { id: 'game1', players: ['player1', 'player2'] };
      const mockShots = [
        { id: 'shot1', votes: 2, author: 'player1', image: 'img1' },
        { id: 'shot2', votes: 3, author: 'player2', image: 'img2' },
      ];
      const mockFacehunt = { id: 'facehunt1' };
    
      beforeEach(() => {
        (gameService.findById as jest.Mock).mockResolvedValue(mockGame);
        (shotService.getGameShots as jest.Mock) = jest.fn().mockResolvedValue(mockShots);
        (shotService.findById as jest.Mock) = jest.fn().mockImplementation((id) =>
          Promise.resolve(mockShots.find(s => s.id === id))
        );
        (shotService.update as jest.Mock) = jest.fn();
        (gateway as any).facehuntService = {
          create: jest.fn().mockResolvedValue(mockFacehunt),
        };
      });
    
      it('should process voting completion and emit facehunt creation', async () => {
        await gateway.handleVotingDone(client, 'game1');
    
        // Call again to simulate all players voted
        await gateway.handleVotingDone({ ...client, data: { player: { id: 'player2', gameId: 'game1' } } } as Socket, 'game1');
    
        expect(shotService.getGameShots).toHaveBeenCalledWith('game1');
        expect((gateway as any).facehuntService.create).toHaveBeenCalledWith(expect.objectContaining({
          author: 'player2', // highest voted shot's author
          game: 'game1',
          image: 'img2',
        }));
    
        expect(server.to).toHaveBeenCalledWith('game1');
        expect(server.emit).toHaveBeenCalledWith('voting-finished', {
          facehuntId: mockFacehunt.id,
          message: 'Voting finished! Facehunt created.',
        });
      });
    
      it('should emit player-done-voting only once per player', async () => {
        await gateway.handleVotingDone(client, 'game1');
        expect(server.to).toHaveBeenCalledWith('game1');
        expect(server.emit).toHaveBeenCalledWith('player-done-voting', { playerId: 'player1' });
      });
    
      it('should throw if game does not exist', async () => {
        (gameService.findById as jest.Mock).mockResolvedValue(null);
        await expect(gateway.handleVotingDone(client, 'game1')).rejects.toThrow();
      });
    });

    describe('handleVoteShot', () => {
      const player = { id: 'player1', gameId: 'game1' };
      const client = createMockSocket(player);
      const mockGame = {
        id: 'game1',
        players: ['player1', 'player2'],
      };
      const mockShot = {
        id: 'shot1',
        votes: 2,
        game: 'game1',
        author: 'player1',
      };
    
      beforeEach(() => {
        (gameService.findById as jest.Mock).mockResolvedValue(mockGame);
        (shotService.findById as jest.Mock) = jest.fn().mockResolvedValue(mockShot);
        (shotService.update as jest.Mock) = jest.fn().mockImplementation((id, update) => ({
          ...mockShot,
          ...update,
        }));
      });
    
      it('should update votes and emit shot-voted', async () => {
        await gateway.handleVoteShot(client, { gameId: 'game1', shotId: 'shot1' });
    
        expect(gameService.findById).toHaveBeenCalledWith('game1');
        expect(shotService.findById).toHaveBeenCalledWith('shot1');
        expect(shotService.update).toHaveBeenCalledWith('shot1', { votes: 3 });
    
        expect(server.to).toHaveBeenCalledWith('game1');
        expect(server.emit).toHaveBeenCalledWith('shot-voted', {
          shotId: 'shot1',
          votes: 3,
        });
      });
    
      it('should throw if game does not exist', async () => {
        (gameService.findById as jest.Mock).mockResolvedValue(null);
    
        await expect(
          gateway.handleVoteShot(client, { gameId: 'game1', shotId: 'shot1' })
        ).rejects.toThrow('Game does not exist');
      });
    
      it('should throw if shot does not exist', async () => {
        (shotService.findById as jest.Mock).mockResolvedValue(null);
    
        await expect(
          gateway.handleVoteShot(client, { gameId: 'game1', shotId: 'shot1' })
        ).rejects.toThrow('Shot does not exist');
      });
    
      it('should throw if player is not in the game', async () => {
        const outsiderClient = createMockSocket({ id: 'outsider', gameId: 'game1' });
    
        await expect(
          gateway.handleVoteShot(outsiderClient, { gameId: 'game1', shotId: 'shot1' })
        ).rejects.toThrow('Player not in game');
      });
    
      it('should handle shots with undefined votes', async () => {
        const noVoteShot = { ...mockShot, votes: undefined };
        (shotService.findById as jest.Mock).mockResolvedValue(noVoteShot);
    
        await gateway.handleVoteShot(client, { gameId: 'game1', shotId: 'shot1' });
    
        expect(shotService.update).toHaveBeenCalledWith('shot1', { votes: 1 });
        expect(server.emit).toHaveBeenCalledWith('shot-voted', {
          shotId: 'shot1',
          votes: 1,
        });
      });
    });
});
