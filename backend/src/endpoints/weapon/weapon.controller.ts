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
import { WeaponService } from './weapon.service';
import { UpdateWeaponDTO, CreateWeaponDTO } from './dto/weapon.dto';
import { MessageService } from '../message/message.service';

@Controller('weapons')
export class WeaponController {
    constructor(
        private readonly weaponService: WeaponService,
    ) {}

    // Get weapon data : Game
    @Get(':id')
    async getWeapon(@Param('id') id: string) {
        const weapon = await this.weaponService.findById(id);

        if(!weapon) throw new NotFoundException('Weapon type not found');

        return weapon;
    }
    
    // List all weapons : Join, Game
    @Get('all')
    async getAllWeapons() {
        return this.weaponService.getAll();
    }
}
