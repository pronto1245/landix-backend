import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SystemDomainDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsUUID()
  flowId: string;
}
