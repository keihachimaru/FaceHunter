import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Shot } from '../../models/shot.model';
import { Model, isValidObjectId } from 'mongoose';
import { CreateShotDTO, UpdateShotDTO } from './dto/shot.dto';
import { Buffer } from 'buffer';
import axios from 'axios';

@Injectable()
export class ShotService {
    constructor (
        @InjectModel(Shot.name) private shotModel: Model<Shot>
    ) {}

    async create(data: CreateShotDTO) {
        return this.shotModel.create(data);
    }

    async deleteAll() {
        return this.shotModel.deleteMany({}).exec();
    }

    async getAll() {
        return this.shotModel.find().exec();
    }

    async findById(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const foundShot = await this.shotModel.findById(id).exec();

        if(!foundShot) throw new NotFoundException(`Shot with id ${id} not found`);

        return foundShot;
    }

    async delete(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const deletedShot = await this.shotModel.findByIdAndDelete(id).exec();

        if(!deletedShot) throw new NotFoundException(`Shot with id ${id} not found`);

        return deletedShot;
    }

    async update(id: string, updateData: UpdateShotDTO) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const updatedShot = await this.shotModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

        if(!updatedShot) throw new NotFoundException(`Shot with id ${id} not found`);
        
        return updatedShot;
    }

    async getGameShots(gameID: string) {
        return await this.shotModel
            .find(
                { game: gameID }
            )
            .exec();
    }
}
