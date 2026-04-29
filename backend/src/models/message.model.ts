import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum MessageStatus {
    SENT = 'sent',
    RECEIVED = 'received',
    READ = 'read',
}

@Schema({ timestamps: true })
export class Message extends Document {
    @Prop({ enum: MessageStatus, default: MessageStatus.SENT })
    status: MessageStatus;
    
    @Prop({ required: true })
    content: string;

    @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
    sender: string;

    @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
    receipt: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
