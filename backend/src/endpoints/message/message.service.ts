import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Message } from '../../models/message.model';
import { Model, isValidObjectId } from 'mongoose';
import { CreateMessageDTO, UpdateMessageDTO } from './dto/message.dto';
import { MessageStatus } from '../../models/message.model';

@Injectable()
export class MessageService {
    constructor (
        @InjectModel(Message.name) private messageModel: Model<Message>
    ) {}

    async create(data: CreateMessageDTO) {
        return this.messageModel.create(data);
    }

    async deleteAll() {
        return this.messageModel.deleteMany({}).exec();
    }

    async getAll() {
        return this.messageModel.find().exec();
    }

    async findById(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const foundMessage = await this.messageModel.findById(id).exec();

        if(!foundMessage) throw new NotFoundException(`Message with id ${id} not found`);

        return foundMessage;
    }

    async delete(id: string) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const deletedMessage = await this.messageModel.findByIdAndDelete(id).exec();

        if(!deletedMessage) throw new NotFoundException(`Message with id ${id} not found`);

        return deletedMessage;
    }

    async update(id: string, updateData: UpdateMessageDTO) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID format');

        const updatedMessage = await this.messageModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

        if(!updatedMessage) throw new NotFoundException(`Message with id ${id} not found`);
        
        return updatedMessage;
    }

    async getMessages(currentUserID: string, otherUserID: string, limit: number) {
        return await this.messageModel
            .find({
                $or: [
                    { sender: currentUserID, receipt: otherUserID },
                    { sender: otherUserID, receipt: currentUserID }
                ]
            })
            .sort({ createdAt: 1 })
            .limit(limit)
            .exec();
    }
    
    async markMessagesAsRead(senderID: string, receiverID: string) {
        const result = await this.messageModel.updateMany(
            {
                sender: senderID,
                receipt: receiverID,
                status: { $ne : MessageStatus.READ },
            },
            {
                $set: {
                    status: MessageStatus.READ,
                }
            }
        ).exec();

        return result.modifiedCount;
    }
}
