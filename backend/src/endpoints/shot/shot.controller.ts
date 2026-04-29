import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
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
import { JwtHttpGuard } from './jwt-http.guard';
import { ShotService } from './shot.service';
import { GameService } from '../game/game.service';

@Controller('shots')
export class ShotController {
    constructor(
        private readonly shotService: ShotService,
        private readonly gameService: GameService,
    ) {}
    
    // Get shots from game
    @UseGuards(JwtHttpGuard)
    @Get(':gameId')
    async getShots(
        @Param('gameId') gameID: string,
        @Req() req: Request,
    ) {
        const playerID = req.user!['id'];
        const game = await this.gameService.findById(gameID);

        if(!game) throw new NotFoundException('Game does not exist');
        if(!game.players.map(p=>p.toString()).includes(playerID)) throw new BadRequestException('Player not in game');

        return await this.shotService.getGameShots(gameID);
    }
}
