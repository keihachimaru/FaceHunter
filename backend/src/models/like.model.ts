import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Like extends Document {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    author: string;

    @Prop({ default : true })
    value: boolean;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Facehunt' })
    facehunt: string;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
