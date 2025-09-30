// dto/reset-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class PasswordResetRequestDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email пользователя' })
  @IsEmail()
  email: string;
}

export class PasswordResetConfirmDto {
  @ApiProperty({ example: 'd9f3a0a82f7b4a63...', description: 'Токен из письма' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'newStrongPassword123!', description: 'Новый пароль' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
