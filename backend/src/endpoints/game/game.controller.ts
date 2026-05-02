import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Query,
    Param,
    Delete,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
    NotFoundException,
    BadRequestException
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GameService } from './game.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { PlayerService } from '../player/player.service';
import { UserService } from '../user/user.service';
import { CreatePlayerDTO } from '../player/dto/player.dto';
import { CreateGameDTO } from './dto/game.dto';
import { UnauthorizedException } from '@nestjs/common';
import { GamemodeService } from '../gamemode/gamemode.service';

@Controller('game')
export class GameController {
    constructor(
        private readonly gameService: GameService,
        private readonly playerService: PlayerService,
        private readonly userService: UserService,
        private readonly gamemodeService: GamemodeService,
        private readonly jwtService: JwtService,
        @InjectConnection() private readonly connection: Connection,
    ) {}
    @UseGuards(JwtAuthGuard)
    @Post('create')
    async createGame(
        @Body() dto: CreateGameDTO   
    ) {
        console.log('Creating game ...');
        const gameTypeName = dto.gameType;
        const gamemode = await this.gamemodeService.findByName(gameTypeName);

        if(!gamemode) throw new NotFoundException('No such gamemode');

        const game = await this.gameService.create(dto);
        return game.identifier;
    }

    @Post('join/:gameId')
    async joinGame(
        @Param('gameId') gameId: string,
        @Req() req: Request
    ) {
        const authHeader = req.headers['authorization'];
        let user: any = null;

        if(authHeader?.startsWith('Bearer ')) {
            const token = authHeader.slice(7);
            try {
                user = this.jwtService.verify(token);
            }
            catch(e) {
                throw new UnauthorizedException('Invalid token');
            }
        }


        const game = await this.gameService.findByIdentifier(gameId);
        if (!game) {
            throw new NotFoundException('Game not found');
        }
        else if (game.ended) {
            throw new BadRequestException('Game already ended');
        }

        const isGuest = !user?.sub;
        console.log(`User ${user?.sub} joining ... `);
        let credits = 100;
        if (!isGuest) {
            const fullUser = await this.userService.findById(user.sub);
            if (!fullUser) throw new NotFoundException('User not found');
            credits = fullUser.credits;
        }

        const dto: CreatePlayerDTO = {
            user: user?.sub?? undefined,
            game: gameId,
            weapon: 'default',
            bullets: [],
            role: 'default',
            remainingHP: 100,
            credits: credits,
        };

        const player = await this.playerService.create(dto);
        await this.gameService.addPlayer(gameId, player.id.toString());

        const token = this.jwtService.sign({
            id: player.id.toString(),
            gameId,
        });
    
        return {
            player,
            token,
            credits: isGuest ? player.credits : credits,
        };
    }
}
