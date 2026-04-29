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
} 
from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FacehuntService } from './facehunt.service';
import { GetFacehuntDTO } from './dto/facehunt.dto';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';

@Controller('facehunts')
export class FacehuntController {
    constructor(
        private readonly facehuntService: FacehuntService,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    // Get facehunt from id : Facehunt
    @Get('details/:id')
    async getFacehunt(@Param('id') id: string) {
        const facehunt = await this.facehuntService.findById(id);

        if(!facehunt) throw new NotFoundException('Facehunt not found');

        return facehunt;
    }
    
    // Get all facehunts : Home
    @UseGuards(JwtAuthGuard)
    @Get('all')
    async getFacehunts(
        @Query('offset') offset: string | undefined,
        @Query('limit') limit: string | undefined,
    ) {
        const parsedOffset = offset && !Number.isNaN(Number(offset)) ? parseInt(offset) : 0;
        const parsedLimit = limit && !Number.isNaN(Number(limit)) ? parseInt(limit) : 10;

        return this.facehuntService.getAll(parsedOffset, parsedLimit);
    }
}
