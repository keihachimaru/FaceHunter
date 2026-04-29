import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Comment } from '../../models/comment.model';
import { Model, isValidObjectId } from 'mongoose';
import { CreateCommentDTO, UpdateCommentDTO } from './dto/comment.dto';

@Injectable()
export class CommentService {
    constructor (
        @InjectModel(Comment.name) private commentModel: Model<Comment>
    ) {}

    async create(data: CreateCommentDTO) {
        return this.commentModel.create(data);
    }

    async deleteAll() {
        return this.commentModel.deleteMany({}).exec();
    }

    async getAll() {
        return this.commentModel.find().exec();
    }

    async findById(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const foundComment = await this.commentModel.findById(id).exec();

        if(!foundComment) throw new NotFoundException(`Comment with id ${id} not found`);

        return foundComment;
    }

    async delete(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const deletedComment = await this.commentModel.findByIdAndDelete(id).exec();

        if(!deletedComment) throw new NotFoundException(`Comment with id ${id} not found`);

        return deletedComment;
    }

    async update(id: string, updateData: UpdateCommentDTO) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const updatedComment = await this.commentModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

        if(!updatedComment) throw new NotFoundException(`Comment with id ${id} not found`);

        return updatedComment;
    }
}
