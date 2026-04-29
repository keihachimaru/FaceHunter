import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Game extends Document {
    @Prop({ required: true , unique: true })
    identifier: string;

    @Prop({ default: false })
    ended: boolean;
    

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    players: string[];

    @Prop({ required: true, type: Types.ObjectId, ref: 'GameMode' })
    gameType: string;
}

export const GameSchema = SchemaFactory.createForClass(Game);
