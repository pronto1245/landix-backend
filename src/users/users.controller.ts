import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

import { GetMeResponseDto } from './dto/getMe-response.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить текущего пользователя' })
  @ApiBearerAuth()
  @Get('me')
  @ApiOkResponse({ description: 'Текущий пользователь', type: GetMeResponseDto })
  getMe(@CurrentUser() user: User): GetMeResponseDto {
    return user;
  }
}
