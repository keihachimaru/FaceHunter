import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Shot extends Document {
    @Prop()
    valid: boolean;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Player' })
    author: string; 

    @Prop({ required: true, type: Types.ObjectId, ref: 'Game' })
    game: string;

    @Prop({ default: 0 })
    votes: number;

    @Prop({ type: Types.ObjectId, ref: 'Player' })
    target: string;

    @Prop()
    image: string;
}

export const ShotSchema = SchemaFactory.createForClass(Shot);
