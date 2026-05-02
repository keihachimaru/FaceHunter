import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Like } from '../../models/like.model';
import { Model, isValidObjectId } from 'mongoose';
import { CreateLikeDTO, UpdateLikeDTO } from './dto/like.dto';

@Injectable()
export class LikeService {
    constructor (
        @InjectModel(Like.name) private likeModel: Model<Like>
    ) {}

    async create(data: CreateLikeDTO) {
        return this.likeModel.create(data);
    }

    async deleteAll() {
        return this.likeModel.deleteMany({}).exec();
    }

    async getAll() {
        return this.likeModel.find().exec();
    }

    async findById(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const foundLike = await this.likeModel.findById(id).exec();

        if(!foundLike) throw new NotFoundException(`Like with id ${id} not found`);

        return foundLike;
    }

    async delete(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const deletedLike = await this.likeModel.findByIdAndDelete(id).exec();

        if(!deletedLike) throw new NotFoundException(`Like with id ${id} not found`);

        return deletedLike;
    }

    async update(id: string, updateData: UpdateLikeDTO) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const updatedLike = await this.likeModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

        if(!updatedLike) throw new NotFoundException(`Like with id ${id} not found`);
        
        return updatedLike;
    }

    async hasUserLikedPost(userId: string, facehuntId: string): Promise<boolean> {
        const exists = await this.likeModel.exists({ author: userId, facehunt: facehuntId });
        return !!exists;
    }

    
    async getLikeByAuthorAndFacehunt(userId: string, facehuntId: string) {
        const like = await this.likeModel.findOne({ author: userId, facehunt: facehuntId });
        return like;
    }
}
