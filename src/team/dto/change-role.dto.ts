import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { TeamRole } from '../types/team-role.enum';

export class ChangeRoleDto {
  @ApiProperty({
    example: TeamRole.ADMIN,
    enum: TeamRole,
    description: 'Новая роль участника в команде'
  })
  @IsEnum(TeamRole)
  role: TeamRole;
}
