import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Bullet } from '../../models/bullet.model';
import { Model, isValidObjectId } from 'mongoose';
import { CreateBulletDTO, UpdateBulletDTO } from './dto/bullet.dto';

@Injectable()
export class BulletService {
    constructor(
        @InjectModel(Bullet.name) private bulletModel: Model<Bullet>
    ) {}

    async create(data: CreateBulletDTO) {
        return this.bulletModel.create(data);
    }

    async deleteAll() {
        return this.bulletModel.deleteMany({}).exec();
    }

    async delete(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const deletedBullet = await this.bulletModel.findByIdAndDelete(id).exec();

        if(!deletedBullet) throw new NotFoundException(`Bullet with id ${id} not found`);

        return deletedBullet;
    }
    
    async update(id: string, updateData: UpdateBulletDTO) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const updatedBullet = await this.bulletModel.findByIdAndUpdate(id, updateData, { new: true })

        if(!updatedBullet) throw new NotFoundException(`Bullet with id ${id} not found`);

        return updatedBullet;
    }
    
    async findById(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const foundBullet = await this.bulletModel.findById(id).exec();

        if(!foundBullet) throw new NotFoundException(`Bullet with id ${id} not found`);

        return foundBullet;
    }

    async getAll() {
        return this.bulletModel.find().exec();
    }
}
