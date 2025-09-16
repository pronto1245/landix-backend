import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CustomDomainDto {
  @ApiProperty({ example: 'mydomain.com' })
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
