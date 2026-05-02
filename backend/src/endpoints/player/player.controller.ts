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
    UseInterceptors, 
    UploadedFile, 
    BadRequestException
} from '@nestjs/common';
import { Request } from 'express';
import { PlayerService } from './player.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { JwtPlayerAuthGuard } from './jwt-player-auth.guard';
import { BuyBulletDTO, ShotDTO } from './dto/player.dto';
import { BulletService } from '../bullet/bullet.service';
import { WeaponService } from '../weapon/weapon.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { ConfigService } from '@nestjs/config';
import { Express } from 'express';
import { UploadService } from '../cloudinary/upload.service';
import axios from 'axios';
import * as FormData from 'form-data';
import { GameService } from '../game/game.service';
import { ShotService } from '../shot/shot.service';

@Controller('player')
export class PlayerController {
    constructor(
        private readonly bulletService: BulletService,
        private readonly weaponService: WeaponService,
        private readonly playerService: PlayerService,
        private readonly gameService: GameService,
        private readonly uploadService: UploadService,
        private readonly shotService: ShotService,
    ) {}

    @UseGuards(JwtPlayerAuthGuard)
    @Get('me')
    async getOwnPlayer(@Req() req: Request) {
        const { id: playerId } = req['player'];
        const player = await this.playerService.findById(playerId);

        if (!player) throw new NotFoundException('Player not found');

        return player;
    }
    
    @UseGuards(JwtPlayerAuthGuard)
    @Post('identify')
    @UseInterceptors(FileInterceptor('file'))
    async identify(
        @UploadedFile() file: Express.Multer.File,
        @Body('uploader') uploader: string,
        @Req() req: Request
    ) {
        const gameId = req['player'].gameId;
        const playerId = req['player'].id;

        const game = await this.gameService.findByIdentifier(gameId);

        const facesData = await Promise.all(
          game.players.map(p => this.playerService.findById(p))
        );
        
        const faces = facesData.map(p => ({ url: p.picture, playerId: p._id }));

        const form = new FormData();
        form.append('file', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
        form.append('faces', JSON.stringify(faces));

        const FACEHUNTER_API_URL = process.env.FACEHUNTER_API_URL || 'http://127.0.0.1:5000';
        const res = await axios.post(
            `${FACEHUNTER_API_URL}/identify-face`,
            form,
            {
                headers: form.getHeaders(),
            }
        );

        if(!res.data.targetId) return { shot : null };

        const authorID = playerId;
        const targetID = res.data.targetId;

        const author = await this.playerService.findById(authorID);
        const target = await this.playerService.findById(targetID);
        
        if(!author || !target) throw new NotFoundException('Players not found');

        const url = await this.uploadService.uploadFile(file, 'players');
        
        const shot = await this.shotService.create({
            valid: true,
            author: authorID,
            game: gameId,
            target: targetID,
            image: url,
        });

        return { shot: shot };
    }   

    @UseGuards(JwtPlayerAuthGuard)
    @Post('upload-picture/:id')
    @UseInterceptors(FileInterceptor('file'))
    async upload(
        @UploadedFile() file: Express.Multer.File,
        @Body('uploader') uploader: string,
        @Param('id') id: string,
    ) {
        const form = new FormData();
        form.append('file', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
        });

        const FACEHUNTER_API_URL = process.env.FACEHUNTER_API_URL || 'http://127.0.0.1:5000';
        const res = await axios.post(
            `${FACEHUNTER_API_URL}/check-face`, 
            form, 
            {
                headers: form.getHeaders(),
            }
        );
        
        if (!res.data.valid) {
          throw new BadRequestException("No recognizable face found in the image.");
        }

        const url = await this.uploadService.uploadFile(file, 'players');
        const saved = await this.playerService.addPicture(url, uploader, id);
        console.log('Valid face uploaded');
        return { url: url };
    }

    @UseGuards(JwtPlayerAuthGuard)
    @Patch('buyBullet')
    async buyBullets(
        @Req() req: Request,
        @Body() dto: BuyBulletDTO
    ) {
        const { id: playerId } = req['player'];
        const bulletIDs = [ ... new Set(dto.sell.concat(dto.buy)) ]
        const bulletObjects = {}

        for(const bulletID of bulletIDs) {
            let bullet = await this.bulletService.findById(bulletID);
            bulletObjects[bulletID] = bullet;
        }
        
        const player = await this.playerService.findById(playerId);
        let balance = player.credits;
        
        for(const bulletID of dto.sell) {
            balance += bulletObjects[bulletID].price;
        }
        for(const bulletID of dto.buy) {
            balance -= bulletObjects[bulletID].price;
        }

        if (balance < 0) throw new BadRequestException('Insufficient credits');

        for(const sellBulletID of dto.sell) {
            const index = player.bullets.indexOf(sellBulletID);
            if(index !== -1) player.bullets.splice(index, 1);
            else throw new BadRequestException('Insufficient bullets to sell');
        }

        for(const buyBulletID of dto.buy) {
            player.bullets.push(buyBulletID);
        }
        
        await this.playerService.update(playerId, {
            bullets: player.bullets,
            credits: balance,
        });
    }
    
    @UseGuards(JwtPlayerAuthGuard)
    @Patch('changeWeapon')
    async changeWeapon(
        @Req() req: Request,
        @Body('weaponID') weaponID: string
    ) {
        const { id: playerId } = req['player'];
        const weapon = await this.weaponService.findById(weaponID);

        if(!weapon) throw new NotFoundException('No such weapon exists');

        await this.playerService.update(playerId, {
            weapon: weaponID
        });
    }
}
