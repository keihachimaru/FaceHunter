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
import { LikeService } from './like.service';
import { CreateLikeDTO } from './dto/like.dto';
import { FacehuntService } from '../facehunt/facehunt.service';
import { UserService } from '../user/user.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';

@Controller('likes')
export class LikeController {
    constructor(
        private readonly likeService: LikeService,
        private readonly facehuntService: FacehuntService,
        private readonly userService: UserService,
    ) {}

    // Like facehunt : Facehunt
    @UseGuards(JwtAuthGuard)
    @Patch('like')
    async likeFacehunt(
        @Req() req: Request,
        @Body() dto: CreateLikeDTO
    ) {
        const userID = dto.author;
        const reqUserID = req.user!['id'];
        const facehuntID = dto.facehunt;

        const user = await this.userService.findById(userID);
        if(!user) throw new NotFoundException('User does not exist');
        if(userID.toString()!==reqUserID.toString()) {
            throw new BadRequestException('Request user and user do not match');
        }

        const facehunt = await this.facehuntService.findById(facehuntID);
        if(!facehunt) throw new NotFoundException('Facehunt does not exist');

        const like = await this.likeService.getLikeByAuthorAndFacehunt(userID, facehuntID);
        if(!like) {
            const like = await this.likeService.create(dto);
        }
        else {
            const updateDTO = {
                value: !like.value,
            }

            return await this.likeService.update(like.id.toString(), updateDTO);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('liked')
    async facehuntIsLiked(
        @Req() req: Request,
        @Query('author') userID: string,
        @Query('facehunt') facehuntID: string,
    ) {
        const reqUserID = req.user!['id'];

        const user = await this.userService.findById(userID);
        if(!user) throw new NotFoundException('User does not exist');
        if(userID.toString()!==reqUserID.toString()) {
            throw new BadRequestException('Request user and user do not match');
        }

        const facehunt = await this.facehuntService.findById(facehuntID);
        if(!facehunt) throw new NotFoundException('Facehunt does not exist');

        const like = await this.likeService.hasUserLikedPost(userID, facehuntID);
        
        return { value : like };
    }
}
