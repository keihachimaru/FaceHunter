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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BulletService } from './bullet.service';
import { UpdateBulletDTO, CreateBulletDTO } from './dto/bullet.dto';
import { MessageService } from '../message/message.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';

@Controller('bullets')
export class BulletController {
    constructor(
        private readonly bulletService: BulletService,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    // Get bullet data : Game
    @Get(':id')
    async getBullet(@Param('id') id: string) {
        const bullet = await this.bulletService.findById(id);

        if(!bullet) throw new NotFoundException('Bullet type not found');

        return bullet;
    }
    
    // List all bullets : Join, Game
    @Get('all')
    async getAllBullets() {
        return this.bulletService.getAll();
    }
}
