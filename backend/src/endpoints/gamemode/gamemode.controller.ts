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
import { GamemodeService } from './gamemode.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@Controller('gamemode')
export class GamemodeController {
    constructor(
        private readonly gamemodeService: GamemodeService,
    ) {}

    // Get gamemode data: Create
    @Get('get/:name')
    async getGamemode(@Param('name') name: string) {
        const gamemode = await this.gamemodeService.findByName(name);
        if(!gamemode) throw new NotFoundException('Gamemode not found');

        return gamemode;
    }

    // List all gamemodes : Create
    @Get('all')
    async getAllGamemodes() {
        return this.gamemodeService.getAll();
    }
}
