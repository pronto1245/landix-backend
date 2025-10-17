import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';

export enum GameType {
  PLINKO = 'plinko',
  SLOTS = 'slots',
  WHEELS = 'wheels',
  PENALTY = 'penalty',
  AVIATOR = 'aviator',
  SCRATCH = 'scratch',
  CHICKEN_ROAD = 'chickenRoad',
  BALLOON = 'balloon',
  IPL = 'ipl',
  MINES = 'mines',
  CRASH = 'crash'
}

/**
 * Вложенные DTO
 */

export class EffectsModalDto {
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  button?: string;
}

export class EffectsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => EffectsModalDto)
  modal?: EffectsModalDto;
}

export class FontDto {
  @IsOptional()
  id?: any;

  @IsOptional()
  text?: any;

  @IsOptional()
  weight?: any;

  @IsOptional()
  lang?: any;
}

export class BonusesInnerModalDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  button?: string;
}

export class BonusesDto {
  @IsOptional()
  @IsString()
  gif?: string;

  @IsOptional()
  @IsString()
  inlineBoxText?: string;

  @IsOptional()
  @IsString()
  activeOnPageLeaveText?: string;

  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean()
  activeOnPageLeave?: boolean;

  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean()
  activeOnPageLoaded?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => BonusesInnerModalDto)
  modal?: BonusesInnerModalDto;
}

export class FreeBetListDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  items?: string[];
}

export class FreeBetDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => FreeBetListDto)
  list?: FreeBetListDto;
}

export class SectorsDto {
  @IsOptional()
  @IsArray()
  list?: any[];

  @IsOptional()
  @IsString()
  fontSizeFirstText?: string;

  @IsOptional()
  @IsString()
  fontSizeSecondText?: string;

  @IsOptional()
  @IsString()
  rate?: string;

  @IsOptional()
  @IsString()
  rateText?: string;

  @IsOptional()
  @IsString()
  balanceText?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value == null ? undefined : Number.isNaN(Number(value)) ? value : Number(value)
  )
  balanceMin?: number | string;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value == null ? undefined : Number.isNaN(Number(value)) ? value : Number(value)
  )
  balanceMax?: number | string;

  @IsOptional()
  @IsString()
  currencySymbol?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => FontDto)
  font?: FontDto;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  buttonCashOut?: string;

  @IsOptional()
  @IsString()
  scratchDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scratchBonuses?: string[];

  @IsOptional()
  @IsString()
  fontSizeScratchSectorFirst?: string;

  @IsOptional()
  @IsString()
  fontSizeScratchSectorSecond?: string;

  @IsOptional()
  @IsString()
  fontSizeScratchSectorThird?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => BonusesDto)
  bonuses?: BonusesDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  multipliers?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => FreeBetDto)
  freeBet?: FreeBetDto;
}

export class PreviewDto {
  @IsOptional()
  @IsString()
  buttonDefault?: string;

  @IsOptional()
  @IsString()
  buttonNext?: string;

  @IsOptional()
  @IsString()
  buttonWin?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(GameType)
  gameType!: GameType;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsString()
  memberId?: string | null;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  pwaName?: string;

  @IsOptional()
  @IsString()
  redirect?: string | null;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : Number(value)))
  @IsNumber()
  spins?: number;

  @IsString()
  template!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  view?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => EffectsDto)
  effects?: EffectsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SectorsDto)
  sectors?: SectorsDto;
}
