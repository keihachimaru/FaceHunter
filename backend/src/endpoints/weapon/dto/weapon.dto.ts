import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateWeaponDTO {
    @IsString()
    readonly name: string;

    @IsNumber()
    readonly capacity: number;

    @IsNumber()
    readonly reloadTime: number;

    @IsNumber()
    readonly zoom: number;

    @IsString()
    @IsOptional()
    readonly skin: string;

    @IsString()
    @IsOptional()
    readonly sound: string;
}

export class UpdateWeaponDTO {
    @IsString()
    @IsOptional()
    readonly name: string;

    @IsNumber()
    @IsOptional()
    readonly capacity: number;

    @IsNumber()
    @IsOptional()
    readonly reloadTime: number;

    @IsNumber()
    @IsOptional()
    readonly zoom: number;

    @IsString()
    @IsOptional()
    readonly skin: string;

    @IsString()
    @IsOptional()
    readonly sound: string;
}
