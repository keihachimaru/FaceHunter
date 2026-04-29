import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Facehunt } from '../../models/facehunt.model';
import { Model, isValidObjectId } from 'mongoose';
import { CreateFacehuntDTO, UpdateFacehuntDTO } from './dto/facehunt.dto';

@Injectable()
export class FacehuntService {
    constructor (
        @InjectModel(Facehunt.name) private facehuntModel: Model<Facehunt>
    ) {}

    async create(data: CreateFacehuntDTO) {
        return this.facehuntModel.create(data);
    }

    async deleteAll() {
        return this.facehuntModel.deleteMany({}).exec();
    }

    async getAll(offset: number, limit: number) {
        return this.facehuntModel.find()
            .skip(offset)
            .limit(limit)
            .exec();
    }

    async findById(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const foundFacehunt = await this.facehuntModel.findById(id).exec();

        if(!foundFacehunt) throw new NotFoundException(`Facehunt with id ${id} not found`);

        return foundFacehunt;
    }

    async delete(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const deletedFacehunt = await this.facehuntModel.findByIdAndDelete(id).exec();

        if(!deletedFacehunt) throw new NotFoundException(`Facehunt with id ${id} not found`);

        return deletedFacehunt;
    }

    async update(id: string, updateData: UpdateFacehuntDTO) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const updatedFacehunt = await this.facehuntModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

        if(!updatedFacehunt) throw new NotFoundException(`Facehunt with id ${id} not found`);
        
        return updatedFacehunt;
    }
}
