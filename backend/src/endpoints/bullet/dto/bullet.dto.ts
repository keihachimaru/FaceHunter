import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateBulletDTO {
    @IsNumber()
    readonly price: number;

    @IsNumber()
    readonly dmgMul: number;

    @IsString()
    readonly name: string;
}

export class UpdateBulletDTO {
    @IsOptional()
    @IsNumber()
    readonly price: number;
    
    @IsOptional()
    @IsNumber()
    readonly dmgMul: number;
}
