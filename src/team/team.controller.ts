import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

import { ChangeRoleDto } from './dto/change-role.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { TeamResponseDto } from './dto/team-response.dto';
import { TeamMember } from './entities/team-member.entity';
import { TeamService } from './team.service';

@ApiTags('Team')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('team')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly usersService: UsersService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Список всех команд, где состоит пользователь' })
  @ApiResponse({ status: 200, type: [TeamMember] })
  async myTeams(@CurrentUser() user: User) {
    return this.teamService.findTeamsForUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить команду по id' })
  @ApiResponse({ status: 200, type: TeamResponseDto })
  async findOne(@Param('id') id: string) {
    return this.teamService.findById(id);
  }

  @Post('create')
  @ApiOperation({ summary: 'Создать новую команду' })
  @ApiResponse({ status: 201, type: TeamResponseDto })
  async create(@CurrentUser() user: User, @Body() dto: CreateTeamDto) {
    return this.teamService.createTeam(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить команду' })
  @ApiParam({ name: 'id', description: 'UUID команды' })
  @ApiResponse({ status: 200, type: TeamResponseDto })
  async update(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: CreateTeamDto) {
    return this.teamService.updateTeam(id, user.id, dto);
  }

  @Get('current')
  @ApiOperation({ summary: 'Получить текущую активную команду пользователя' })
  @ApiResponse({ status: 200, type: TeamResponseDto })
  async getCurrent(@CurrentUser() user: User) {
    return user.activeTeam;
  }

  @Patch('switch/:id')
  @ApiOperation({ summary: 'Сменить активную команду' })
  @ApiParam({ name: 'id', description: 'UUID команды' })
  async switchTeam(@CurrentUser() user: User, @Param('id') teamId: string) {
    const team = await this.teamService.findById(teamId);
    const isMember = await this.teamService.isMember(user.id, teamId);
    if (!isMember) throw new Error('Вы не состоите в этой команде');

    await this.usersService.update(user.id, { activeTeam: team });
    return { ok: true, activeTeam: team };
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Пригласить пользователя в команду' })
  @ApiParam({ name: 'id', description: 'UUID команды' })
  @ApiResponse({ status: 201, type: TeamMember })
  async invite(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: InviteMemberDto) {
    return this.teamService.inviteMember(id, user.id, dto.email, dto.role);
  }

  @Patch(':id/members/:memberId')
  @ApiOperation({ summary: 'Изменить роль участника в команде' })
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'memberId' })
  @ApiResponse({ status: 200, type: TeamMember })
  async changeRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: User,
    @Body() dto: ChangeRoleDto
  ) {
    return this.teamService.changeMemberRole(id, user.id, memberId, dto.role);
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: 'Удалить участника из команды' })
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'memberId' })
  @ApiResponse({ status: 200, schema: { example: { ok: true } } })
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: User
  ) {
    return this.teamService.removeMember(id, user.id, memberId);
  }
}
