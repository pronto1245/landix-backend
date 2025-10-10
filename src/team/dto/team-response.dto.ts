import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';

import { TeamBalance } from '../entities/team-balance.entity';

export class TeamResponseDto {
  @ApiProperty({ example: 'b8c12a5e-2a90-4e74-88df-f64a17d34a21' })
  id: string;

  @ApiProperty({ example: 'Команда маркетинга' })
  name: string;

  @ApiProperty({ example: 'Описание команды', nullable: true })
  description?: string;

  @ApiProperty({ type: () => User })
  owner: User;

  @ApiProperty({ type: () => TeamBalance })
  balance: TeamBalance;
}
