import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Gamemode } from '../../models/gamemode.model';
import { Model, isValidObjectId } from 'mongoose';
import { CreateGamemodeDTO, UpdateGamemodeDTO } from './dto/gamemode.dto';

@Injectable()
export class GamemodeService {
    constructor (
        @InjectModel(Gamemode.name) private gamemodeModel: Model<Gamemode>
    ) {}

    async create(data: CreateGamemodeDTO) {
        return this.gamemodeModel.create(data);
    }

    async deleteAll() {
        return this.gamemodeModel.deleteMany({}).exec();
    }

    async getAll() {
        return this.gamemodeModel.find().exec();
    }

    async findById(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const foundGamemode = await this.gamemodeModel.findById(id).exec();

        if(!foundGamemode) throw new NotFoundException(`Gamemode with id ${id} not found`);

        return foundGamemode;
    }

    async findByName(name: string) {
        const foundGamemode = await this.gamemodeModel.findOne({ name }).exec();

        if(!foundGamemode) throw new NotFoundException(`Gamemode with name${name} not found`);

        return foundGamemode;
    }

    async delete(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const deletedGamemode = await this.gamemodeModel.findByIdAndDelete(id).exec();

        if(!deletedGamemode) throw new NotFoundException(`Gamemode with id ${id} not found`);

        return deletedGamemode;
    }

    async update(id: string, updateData: Partial<UpdateGamemodeDTO>) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const updatedGamemode = await this.gamemodeModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

        if(!updatedGamemode) throw new NotFoundException(`Gamemode with id ${id} not found`);
        
        return updatedGamemode;
    }
}
