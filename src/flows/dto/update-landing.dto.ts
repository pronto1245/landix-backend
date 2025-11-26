import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateLandingDto {
  @ApiProperty({
    description: 'ID лендинга',
    example: 'c0d8f0ae-7238-4419-9218-b0b586c91387'
  })
  @IsString()
  @IsNotEmpty()
  landingId: string;
}
