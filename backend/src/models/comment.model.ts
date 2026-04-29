import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment extends Document {
    @Prop({ required: true })
    content: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    author: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Facehunt' })
    facehunt: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
