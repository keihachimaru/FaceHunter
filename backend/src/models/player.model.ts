import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Player extends Document {
    @Prop({ ref: 'User', unique: true, type: Types.ObjectId})
    user?: string;

    @Prop({ ref: 'Game', required: true, type: Types.ObjectId })
    game: string;

    @Prop({ ref: 'Weapon', required: true, type: Types.ObjectId })
    weapon: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Bullet' }], default: [] })
    bullets: string[];

    @Prop({ ref: 'Role', required: true, type: Types.ObjectId })
    role: string;
    
    @Prop({ required: true })
    remainingHP: number;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Shot' }], default: [] })
    shots: string[];

    @Prop({ required: true })
    credits: number;

    @Prop({ default: false })
    ready: boolean;

    @Prop({ default : '' })
    picture: string;

    @Prop({ default : '' })
    pictureUploader: string;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
