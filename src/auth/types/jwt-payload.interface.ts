import { UserRole } from 'src/users/enums/role.enum';

export interface JwtPayload {
  email: string;
  role: UserRole;
  sub: string;
}
