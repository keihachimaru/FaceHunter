import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateCommentDTO {
    @IsString()
    readonly content: string;

    @IsString()
    readonly author: string;

    @IsString()
    readonly facehunt: string;
}

export class UpdateCommentDTO {
    @IsString()
    readonly content: string;
}

export class DeleteCommentDTO {
    @IsString()
    readonly id: string;
}

export class PatchCommentDTO {
    @IsString()
    readonly id: string;

    @IsString()
    readonly content: string;
}
