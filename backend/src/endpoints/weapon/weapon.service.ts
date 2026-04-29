import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Weapon } from '../../models/weapon.model';
import { Model, isValidObjectId } from 'mongoose';
import { CreateWeaponDTO, UpdateWeaponDTO } from './dto/weapon.dto';

@Injectable()
export class WeaponService {
    constructor (
        @InjectModel(Weapon.name) private weaponModel: Model<Weapon>
    ) {}

    async create(data: Partial<CreateWeaponDTO>) {
        return this.weaponModel.create(data);
    }

    async deleteAll() {
        return this.weaponModel.deleteMany({}).exec();
    }

    async getAll() {
        return this.weaponModel.find().exec();
    }

    async findById(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const foundWeapon = await this.weaponModel.findById(id).exec();

        if(!foundWeapon) throw new NotFoundException(`Weapon with id ${id} not found`);

        return foundWeapon;
    }

    async delete(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const deletedWeapon = await this.weaponModel.findByIdAndDelete(id).exec();

        if(!deletedWeapon) throw new NotFoundException(`Weapon with id ${id} not found`);

        return deletedWeapon;
    }

    async update(id: string, updateData: Partial<UpdateWeaponDTO>) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const updatedWeapon = await this.weaponModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

        if(!updatedWeapon) throw new NotFoundException(`Weapon with id ${id} not found`);
        
        return updatedWeapon;
    }
}
