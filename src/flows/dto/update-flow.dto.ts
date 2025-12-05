import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested
} from 'class-validator';

export class CloakDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  blockBots?: boolean;

  @IsOptional()
  @IsString()
  allowedCountry?: string;

  @IsOptional()
  @IsString()
  whitePageHtml?: string;
}

export class SplitVariantDto {
  @IsString()
  landingId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;
}

export class SplitTestDto {
  @IsBoolean()
  enabled: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SplitVariantDto)
  variants: SplitVariantDto[];
}

export class UpdateFlowDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  landingId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CloakDto)
  cloak?: CloakDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SplitTestDto)
  splitTest?: SplitTestDto;
}
