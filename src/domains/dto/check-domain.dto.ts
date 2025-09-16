import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckDomainDto {
  @ApiProperty({ example: 'mycasino.fun' })
  @IsString()
  @IsNotEmpty()
  domain: string;
}
