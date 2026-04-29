import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from '../../models/user.model';
import { Model, isValidObjectId, ClientSession } from 'mongoose';
import { CreateUserDTO, UpdateUserDTO } from './dto/user.dto';

@Injectable()
export class UserService {
    constructor (
        @InjectModel(User.name) private userModel: Model<User>
    ) {}

    async findByEmail(email: string) {
        return this.userModel.findOne({ email }).exec();
    }

    async create(data: Partial<CreateUserDTO>) {
        return this.userModel.create(data);
    }

    async deleteAll() {
        return this.userModel.deleteMany({}).exec();
    }

    async getAll() {
        return this.userModel.find().exec();
    }

    async findById(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const foundUser = await this.userModel.findById(id).exec();

        if(!foundUser) throw new NotFoundException(`User with id ${id} not found`);

        return foundUser;
    }

    async delete(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

        if(!deletedUser) throw new NotFoundException(`User with id ${id} not found`);

        return deletedUser;
    }

    async update(id: string, updateData: Partial<UpdateUserDTO>, session?: ClientSession) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const updatedUser = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).session(session ?? null).exec();

        if(!updatedUser) throw new NotFoundException(`User with id ${id} not found`);
        
        return updatedUser;
    }
}
