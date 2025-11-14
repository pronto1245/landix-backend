import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CheckDomainDto {
  @ApiProperty({
    example: 'example.fun',
    description: 'Имя домена для проверки'
  })
  @IsString()
  name: string;
}
