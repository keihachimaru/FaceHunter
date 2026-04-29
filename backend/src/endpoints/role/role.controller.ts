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
import { RoleService } from './role.service';
import { UpdateRoleDTO, CreateRoleDTO } from './dto/role.dto';
import { MessageService } from '../message/message.service';

@Controller('roles')
export class RoleController {
    constructor(
        private readonly roleService: RoleService,
    ) {}

    // Get role data : Game
    @Get(':id')
    async getRole(@Param('id') id: string) {
        const role = await this.roleService.findById(id);

        if(!role) throw new NotFoundException('Role type not found');

        return role;
    }
    
    // List all roles : Join, Game
    @Get('all')
    async getAllRoles() {
        return await this.roleService.getAll();
    }
}
