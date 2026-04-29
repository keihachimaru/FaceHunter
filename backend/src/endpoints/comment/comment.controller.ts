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
} 
from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommentService } from './comment.service';
import { CreateCommentDTO, PatchCommentDTO, DeleteCommentDTO } from './dto/comment.dto';
import { FacehuntService } from '../facehunt/facehunt.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';

@Controller('comments')
export class CommentController {
    constructor(
        private readonly commentService: CommentService,
        private readonly facehuntService: FacehuntService,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    // Get all comments given a post : Post
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getComment(@Req() req: Request, @Param('id') id: string) {
        const comment = await this.commentService.findById(id);
        
        if(!comment) throw new NotFoundException('Comment not found');

        return comment;
    }

    // Delete a comment by user : Post
    @UseGuards(JwtAuthGuard)
    @Delete('delete')
    async deleteComment(@Req() req: Request, @Body() dto: DeleteCommentDTO) {
        const comment = await this.commentService.findById(dto.id);

        if(!comment) throw new NotFoundException('Comment not found');

        if(comment.author.toString() === req.user!['id']) {
            await this.commentService.delete(dto.id);
        }
        else {
            throw new BadRequestException('Cannot delete a comment that is not yours');
        }

        return { message : 'Comment successfully deleted' };
    }

    //Edit a comment by user : Post
    @UseGuards(JwtAuthGuard)
    @Patch('update')
    async updateComment(@Req() req: Request, @Body() dto: PatchCommentDTO) {
        const comment = await this.commentService.findById(dto.id);

        if(!comment) throw new NotFoundException('Comment not found');

        if(comment.author.toString() === req.user!['id']) {
            await this.commentService.update(dto.id, { content: dto.content });
        }
        else {
            throw new BadRequestException('Cannot update a comment that is not yours');
        }

        return { message : 'Comment successfully edited' };
    }

    //Post a comment by user : Post
    @UseGuards(JwtAuthGuard)
    @Post('new')
    async postComment(@Req() req: Request, @Body() dto: CreateCommentDTO) {
        const facehuntId = dto.facehunt;
        const authorId = dto.author;

        if(req.user!['id'] != authorId) throw new BadRequestException('Author and user do not match');
        const facehunt = await this.facehuntService.findById(facehuntId);

        if(!facehunt) throw new BadRequestException('Facehunt does not exist');

        return await this.commentService.create(dto);
    }
}
