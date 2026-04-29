import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
    ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { ShotService } from '../shot/shot.service';
import { PlayerService} from '../player/player.service';
import { JwtGuestGuard } from './jwt-guest.guard';
import { JwtWsGuard } from './jwt-ws.guard';
import { UseGuards, BadRequestException } from '@nestjs/common';
import { CreateShotDTO } from '../shot/dto/shot.dto';
import { Buffer } from 'buffer';
import { NotFoundException } from '@nestjs/common';
import { FacehuntService } from '../facehunt/facehunt.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreatePlayerDTO } from '../player/dto/player.dto';

@UseGuards(JwtGuestGuard)
@WebSocketGateway({
    namespace: '/wsgame',
    cors: { origin: '*' },
})
export class GameGateway
    implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection
{
    @WebSocketServer() server: Server;

    private votingCompletedPlayers: Map<string, Set<string>> = new Map();

    constructor(
        private readonly shotService: ShotService,
        private readonly gameService: GameService,
        private readonly playerService: PlayerService,
        private readonly facehuntService: FacehuntService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
    ) {}

    afterInit(server: Server) {
        console.log('Game Gateway initialized');
    }

    async handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        const gameId = client.handshake.query.gameId;
        if (gameId) {
            client.join(`game:${gameId}`)
        };
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);

    }

    @SubscribeMessage('shoot')
    async handleShoot(
        @ConnectedSocket() client: Socket,
        @MessageBody() shotID: string,
    ) {
        console.log('Shot fired');
        const playerId = client.data.player.id;
        const gameId = client.data.player.gameId;
        const shot = await this.shotService.findById(shotID);
        
        const shotEvent =  {
            shooterID: shot.author,
            shotID: shotID,
            targetID: shot.target,
            valid: true,
            time: shot.get('createdAt'),
        };

        const target =  await this.playerService.setDead(shotEvent.targetID); 

        const game = await this.gameService.findByIdentifier(gameId);
        const players = await Promise.all(
            game.players.map(p => this.playerService.findById(p))
        );
        const deadCount = players.filter(p => p.remainingHP <= 0).length;

        this.server.to(`game:${gameId}`).emit('shot-event', { event : shotEvent })

        if(deadCount>=game.players.length - 1) {
            this.server.to(`game:${gameId}`).emit('round-ended')
            for(const p of game.players) {
                await this.playerService.setAlive(p);
            }
        }
    }
    
    @UseGuards(JwtWsGuard)
    @SubscribeMessage('gameEnded')
    async handleGameEnded(
        @ConnectedSocket() client: Socket,
    ) {
        console.log('Game ended');
        const playerId = client.data.player.id;
        const gameId = client.data.player.gameId;
        
        const candidates = await this.shotService.getGameShots(gameId);
        
        this.server.to(`game:${gameId}`).emit('highlight-candidates', { candidates: candidates });
    }

    @UseGuards(JwtWsGuard)
    @SubscribeMessage('requestGameState')
    async handleRequestGameState(
        @ConnectedSocket() client: Socket,
    ) {
        const playerId = client.data.player.id;
        const gameId = client.data.player.gameId;
        
        const updatedGame = await this.gameService.findByIdentifier(gameId);
        const playerIds = updatedGame.players.filter(p => p!=playerId);
        const playerObjs = await Promise.all(
            playerIds.map(p => this.playerService.findById(p))
        );

        client.emit('game-state', { game : updatedGame, otherPlayers : playerObjs });
    }

    @UseGuards(JwtWsGuard)
    @SubscribeMessage('voteShot')
        async handleVoteShot(
            @ConnectedSocket() client: Socket,
            @MessageBody() { shotId }: { shotId: string }
        ) {
            const playerId = client.data.player.id;
            const gameId = client.data.player.gameId;
    
            const game = await this.gameService.findByIdentifier(gameId);
            const shot = await this.shotService.findById(shotId);
    
            if (!game) throw new NotFoundException('Game does not exist');
            if (!shot) throw new NotFoundException('Shot does not exist');
            if (!game.players.map(p => p.toString()).includes(playerId))
                throw new BadRequestException('Player not in game');
    
            // Update votes
            const updatedShot = await this.shotService.update(shotId, { votes : (shot.votes || 0) + 1 });
    
            console.log('Shot voted');
            // this.server.to(gameId).emit('shot-voted', {
            //     shotId: updatedShot.id,
            //     votes: updatedShot.votes,
            // });
    }


    @UseGuards(JwtWsGuard)
    @SubscribeMessage('ready')
    async handleReady(
        @ConnectedSocket() client: Socket,
    ) {
        const playerId = client.data.player.id;
        const gameId = client.data.player.gameId;

        console.log('Player '+playerId+' ready in '+gameId);

        const game = await this.gameService.findByIdentifier(gameId);
        if(!game) {
            throw new NotFoundException('Game not found');
        }
        else if (game.ended) {
            throw new BadRequestException('Game already ended');
        }

        await this.playerService.setReady(playerId);
        
        const players = await Promise.all(
            game.players.map(p => this.playerService.findById(p))
        );
        const readyCount = players.filter(p=>p.ready).length;

        client.join(playerId);
        this.server.to(`game:${gameId}`).emit('playerReady', {
            ready: readyCount,
            total: game.players.length 
        })
    }

    @SubscribeMessage('join')
    async handleJoin(
        @ConnectedSocket() client: Socket,
    ) {
        
        // We dont do this in guard cuz it is optional, we aren't 
        // gatekeeping, just checking.

        const user = client.data.player;
        const gameId = user.gameId;

        const game = await this.gameService.findByIdentifier(gameId);
        if (!game) {
            throw new NotFoundException('Game not found');
        }
        else if (game.ended) {
            throw new BadRequestException('Game already ended');
        }

        const isGuest = !user.id;
        console.log(`User ${user.id} joining ... `);
        let credits = 100;
        if (!isGuest) {
            const fullUser = await this.userService.findById(user.id);
            if (!fullUser) throw new NotFoundException('User not found');
            credits = fullUser.credits;
        }
        const dto: CreatePlayerDTO = {
            user: user.id?? null,
            game: gameId,
            weapon: 'default',
            bullets: [],
            role: 'default',
            remainingHP: 100,
            credits: credits,
        };

        let playerExists;
        if(!isGuest) {
            playerExists = await this.playerService.findByUser(user.id);
        }
        const player = playerExists ?? await this.playerService.create(dto);

        const totalPlayers = game.players.length + (!game.players.includes(player.id.toString()) ? 1 : 0);
        await this.gameService.addPlayer(gameId, player.id.toString());

        //Now when accesing the /player endpoints for buying 
        //weapons, bullets, we have the playerId.
        const token = this.jwtService.sign({
            id: player.id.toString(),
            gameId: gameId,
        });

        client.emit('gameJoin', {
            player,
            token,
        });

        const rooms = Array.from(client.rooms);
        this.server.to(`game:${gameId}`).emit('playerJoined', {
            player: player.id.toString(),
            total: totalPlayers
        })
    }

    @UseGuards(JwtWsGuard)
    @SubscribeMessage('votingDone')
    async handleVotingDone(
        @ConnectedSocket() client: Socket,
    ) {
        const playerId = client.data.player.id;
        const gameId = client.data.player.gameId;

        const game = await this.gameService.findByIdentifier(gameId);

        if (!game) throw new NotFoundException('Game does not exist');
        if (!game.players.map(p => p.toString()).includes(playerId))
            throw new BadRequestException('Player not in game');

        if (!this.votingCompletedPlayers.has(gameId)) {
            this.votingCompletedPlayers.set(gameId, new Set());
        }

        const donePlayers = this.votingCompletedPlayers.get(gameId);
        donePlayers!.add(playerId);

        if (donePlayers!.size === game.players.length) {
            this.votingCompletedPlayers.delete(gameId);

            const shots = await this.shotService.getGameShots(gameId);
            if (!shots.length) throw new BadRequestException('No shots found');

            const topShot = shots.reduce((max, shot) => shot.votes > max.votes ? shot : max, shots[0]);
            console.log(topShot);
            const facehunt = await this.facehuntService.create({
                name: `Game ${gameId} Results`,
                author: topShot.author.toString(),
                game: gameId,
                image: topShot.image,  
            });

            const votesArray = Object.entries(
              shots.reduce((acc, shot) => {
                const author = shot.author;
                const votes = shot.votes || 0;
                acc[author] = (acc[author] || 0) + votes;
                return acc;
              }, {})
            ).map(([id, votes]) => ({ id, votes }));

            this.server.to(`game:${gameId}`).emit('voting-ended', {
                facehunt: facehunt.image,
                leaderboard: votesArray,
            });

            if(game._id) await this.gameService.endGame(game._id);
        }
    }
}
