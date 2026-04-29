import { IsNumber, IsString, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class CreatePlayerDTO {
    @IsOptional()
    @IsString()
    readonly user: string;

    @IsString()
    readonly game: string;

    @IsString()
    readonly weapon: string;

    @IsArray()
    @IsString({ each: true })
    readonly bullets: string[];

    @IsString()
    readonly role: string;

    @IsNumber()
    readonly remainingHP: number;
    
    @IsNumber()
    readonly credits: number;
}

export class UpdatePlayerDTO {
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    readonly bullets: string[];
    
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    readonly shots: string[];

    @IsNumber()
    @IsOptional()
    readonly remainingHP: number;

    @IsNumber()
    @IsOptional()
    readonly credits: number;

    @IsString()
    @IsOptional()
    readonly weapon: string;
}

export class BuyBulletDTO {
    @IsArray()
    @IsString({ each: true })
    readonly buy: string[];

    @IsArray()
    @IsString({ each: true })
    readonly sell: string[];
}

export class ShotDTO {
    @IsBoolean()
    readonly valid: boolean;

    @IsString()
    readonly target: string;

    @IsString()
    readonly bullet: string;

    @IsString()
    readonly weapon: string;

    @IsString()
    readonly gamemode: string;
}
