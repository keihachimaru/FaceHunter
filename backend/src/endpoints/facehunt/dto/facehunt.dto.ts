import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateFacehuntDTO {
    @IsString()
    @IsOptional()
    readonly name: string;

    @IsString()
    readonly author: string;

    @IsString()
    readonly game: string;

    @IsString()
    readonly image: string;
}

export class UpdateFacehuntDTO {
    @IsString()
    @IsOptional()
    readonly name: string;
}

export class GetFacehuntDTO {
    @IsString()
    readonly id: string;
}
