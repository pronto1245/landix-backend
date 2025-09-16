import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/users/enums/role.enum';

export class GetMeResponseDto {
  @ApiProperty({ example: 'fb205b67-27df-4e3d-b64b-9a223b7b1a8c' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole;
}
