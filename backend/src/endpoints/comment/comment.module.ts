import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentService } from './comment.service';
import { Comment, CommentSchema } from '../../models/comment.model';
// import { FacehuntModule } from '../facehunt/facehunt.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
        // FacehuntModule,
    ],
    providers: [ CommentService ],
    exports: [ CommentService ],
})

export class CommentModule {}
