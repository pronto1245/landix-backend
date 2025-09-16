import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class BuyDomainDto {
  @ApiProperty({ example: 'example.fun' })
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsUUID()
  flowId: string;
}
