// src/landings/dto/create-landing.dto.ts
import { IsInt, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLandingDto {
  @IsOptional() @IsUUID() memberId?: string;

  @IsString() name!: string;
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string;

  @IsString() gameType!: string; // 'wheels'
  @IsString() template!: string; // '3HotChiliesThree'
  @IsString() view!: string; // 'landing-pages/3HotChiliesThree'

  @IsOptional() @IsString() locale?: string; // 'ua'
  @IsOptional() @IsInt() spins?: number;

  @IsOptional() @IsObject() sectors?: any;
  @IsOptional() @IsObject() effects?: any;

  @IsOptional() @IsString() redirect?: string;
  @IsOptional() @IsObject() extra?: any;
}
