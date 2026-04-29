import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Player } from '../../models/player.model';
import { Model, isValidObjectId } from 'mongoose';
import { CreatePlayerDTO, UpdatePlayerDTO } from './dto/player.dto';

@Injectable()
export class PlayerService {
    constructor (
        @InjectModel(Player.name) private playerModel: Model<Player>
    ) {}

    async create(data: Partial<CreatePlayerDTO>) {
        const userID = data.user;
        if(userID) {
            const player = await this.playerModel.findOne({ user : data.user }).exec();
            if(player) return player;
        }
        return this.playerModel.create(data);
    }

    async deleteAll() {
        return this.playerModel.deleteMany({}).exec();
    }

    async getAll() {
        return this.playerModel.find().exec();
    }

    async addPicture(url: string, uploader:string, id: string) {
        const updatedPlayer = await this.playerModel.findByIdAndUpdate(
            id, 
            { 
                picture: url,
                pictureUploader: uploader
            },
            { new: true }
        ).exec();

        if(!updatedPlayer) throw new NotFoundException(`Player with id ${id} not found`);

        return updatedPlayer;
    }

    async findById(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const foundPlayer = await this.playerModel.findById(id).exec();

        if(!foundPlayer) throw new NotFoundException(`Player with id ${id} not found`);

        return foundPlayer;
    }

    async findByUser(userId: string) {
        const foundPlayer = await this.playerModel.findOne({ user: userId}).exec();
        return foundPlayer;
    }

    async delete(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const deletedPlayer = await this.playerModel.findByIdAndDelete(id).exec();

        if(!deletedPlayer) throw new NotFoundException(`Player with id ${id} not found`);

        return deletedPlayer;
    }

    async update(id: string, updateData: Partial<UpdatePlayerDTO>) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const updatedPlayer = await this.playerModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

        if(!updatedPlayer) throw new NotFoundException(`Player with id ${id} not found`);
        
        return updatedPlayer;
    }

    async setReady(id: string) {
        const updatedPlayer = await this.playerModel.findByIdAndUpdate(
            id,
            { ready: true},
            { new: true }
        ).exec();

        if (!updatedPlayer) throw new NotFoundException(`Player with id ${id} not found`);

        return updatedPlayer
    }

    async setDead(id: string) {
        const updatedPlayer = await this.playerModel.findByIdAndUpdate(
            id,
            { remainingHP: 0},
            { new: true }
        ).exec();

        if (!updatedPlayer) throw new NotFoundException(`Player with id ${id} not found`);

        return updatedPlayer
    }

    async setAlive(id: string) {
        const updatedPlayer = await this.playerModel.findByIdAndUpdate(
            id,
            { remainingHP: 100},
            { new: true }
        ).exec();

        if (!updatedPlayer) throw new NotFoundException(`Player with id ${id} not found`);

        return updatedPlayer
    }
}
