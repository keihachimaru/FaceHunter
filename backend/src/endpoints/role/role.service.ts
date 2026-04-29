import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Role } from '../../models/role.model';
import { Model, isValidObjectId } from 'mongoose';
import { CreateRoleDTO, UpdateRoleDTO } from './dto/role.dto';

@Injectable()
export class RoleService {
    constructor (
        @InjectModel(Role.name) private roleModel: Model<Role>
    ) {}

    async create(data: CreateRoleDTO) {
        return this.roleModel.create(data);
    }

    async deleteAll() {
        return this.roleModel.deleteMany({}).exec();
    }

    async getAll() {
        return this.roleModel.find().exec();
    }

    async findById(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const foundRole = await this.roleModel.findById(id).exec();

        if(!foundRole) throw new NotFoundException(`Role with id ${id} not found`);

        return foundRole;
    }

    async delete(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const deletedRole = await this.roleModel.findByIdAndDelete(id).exec();

        if(!deletedRole) throw new NotFoundException(`Role with id ${id} not found`);

        return deletedRole;
    }

    async update(id: string, updateData: UpdateRoleDTO) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const updatedRole = await this.roleModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

        if(!updatedRole) throw new NotFoundException(`Role with id ${id} not found`);

        return updatedRole;
    }
}
