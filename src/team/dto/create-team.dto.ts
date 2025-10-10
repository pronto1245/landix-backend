import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ example: 'Команда трафика №1', description: 'Название команды' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
