import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Game } from '../../models/game.model';
import { Model, isValidObjectId } from 'mongoose';
import { CreateGameDTO, UpdateGameDTO } from './dto/game.dto';
import { Types } from 'mongoose';
import { randomUUID } from 'crypto';

@Injectable()
export class GameService {
    constructor (
        @InjectModel(Game.name) private gameModel: Model<Game>
    ) {}

    async create(data: CreateGameDTO) {
        const identifier = randomUUID();
        return this.gameModel.create({ ...data, identifier });
    }

    async deleteAll() {
        return this.gameModel.deleteMany({}).exec();
    }

    async getAll() {
        return this.gameModel.find().exec();
    }

    async findById(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');
        const foundGame = await this.gameModel.findById(new Types.ObjectId(id)).exec();

        if(!foundGame) throw new NotFoundException(`Game with id ${id} not found`);

        return foundGame;
    }

    async findByIdentifier(identifier: string) {
        const foundGame = await this.gameModel.findOne({ identifier : identifier }).exec();

        if (!foundGame) 
            throw new NotFoundException(`Game with identifier ${identifier} not found`);

        return foundGame;
    }

    async delete(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const deletedGame = await this.gameModel.findByIdAndDelete(id).exec();

        if(!deletedGame) throw new NotFoundException(`Game with id ${id} not found`);

        return deletedGame;
    }

    async update(id: string, updateData: Partial<UpdateGameDTO>) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const updatedGame = await this.gameModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

        if(!updatedGame) throw new NotFoundException(`Game with id ${id} not found`);
        
        return updatedGame;
    }

    async addPlayer(gameId: string, playerId: string) {
        const game = await this.gameModel.findOne({ identifier: gameId }).exec();

        if(!game) {
            throw new NotFoundException('Game not found');
        }

        const playerObjectId = new Types.ObjectId(playerId);

        if(!game.players.some(id => id.toString() === playerObjectId.toString())) {
            game.players.push(playerObjectId.toHexString());
            await game.save();
        }

        return game;
    }

    async endGame(gameId) {
        const updatedGame = await this.gameModel.findByIdAndUpdate(
            gameId,
            { ended : true },
            { new: true }
        ).exec();
        console.log('Game '+gameId+' ended');

        return updatedGame;
    }
}
