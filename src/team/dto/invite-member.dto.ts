import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';

import { TeamRole } from '../types/team-role.enum';

export class InviteMemberDto {
  @ApiProperty({
    example: 'example@example.com',
    description: 'Email пользователя для приглашения'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: TeamRole.FINANCE,
    enum: TeamRole,
    description: 'Роль участника в команде (по умолчанию MEMBER)',
    required: false
  })
  @IsOptional()
  @IsEnum(TeamRole)
  role: TeamRole;
}
