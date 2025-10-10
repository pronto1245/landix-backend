import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

import { TeamBalance } from './entities/team-balance.entity';
import { TeamMember } from './entities/team-member.entity';
import { Team } from './entities/team.entity';
import { TeamRole } from './types/team-role.enum';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team) private teamsRepo: Repository<Team>,
    @InjectRepository(TeamMember) private membersRepo: Repository<TeamMember>,
    @InjectRepository(TeamBalance) private balanceRepo: Repository<TeamBalance>,
    private usersService: UsersService
  ) {}

  async createDefaultTeamForUser(user: User, teamName?: string) {
    const name = teamName || 'Моя команда';

    const team = this.teamsRepo.create({
      name,
      owner: user,
      balance: this.balanceRepo.create({ amount: 0 })
    });
    await this.teamsRepo.save(team);

    const member = this.membersRepo.create({
      team,
      user,
      role: TeamRole.OWNER
    });
    await this.membersRepo.save(member);

    return team;
  }

  async createTeam(ownerId: string, dto: { name: string }) {
    const owner = await this.usersService.findById(ownerId);

    const team = this.teamsRepo.create({
      name: dto.name,
      owner
    });
    await this.teamsRepo.save(team);

    const member = this.membersRepo.create({
      team,
      user: owner,
      role: TeamRole.OWNER
    });
    await this.membersRepo.save(member);

    const balance = this.balanceRepo.create({
      team,
      amount: 0
    });
    await this.balanceRepo.save(balance);

    team.balance = balance;
    await this.teamsRepo.save(team);

    return team;
  }

  async findTeamsForUser(userId: string) {
    return this.membersRepo.find({
      where: { user: { id: userId } },
      relations: ['team', 'team.owner', 'team.balance']
    });
  }

  async findById(teamId: string) {
    const t = await this.teamsRepo.findOne({ where: { id: teamId } });
    if (!t) throw new NotFoundException('Команда не найдена');
    return t;
  }

  async inviteMember(
    teamId: string,
    inviterId: string,
    userEmailToInvite: string,
    role: TeamRole = TeamRole.MEMBER
  ) {
    const team = await this.findById(teamId);

    if (!team) throw new NotFoundException('Команда не найдена');

    const inviterMember = await this.membersRepo.findOne({
      where: { team: { id: teamId }, user: { id: inviterId } }
    });

    if (!inviterMember) throw new ForbiddenException('Вы не участник этой команды');

    if (![TeamRole.ADMIN, TeamRole.OWNER].includes(inviterMember.role))
      throw new ForbiddenException('Не хватает прав');

    const user = await this.usersService.findByEmail(userEmailToInvite);

    if (!user) throw new NotFoundException('Пользователь с таким email не найден');

    const exists = await this.membersRepo.findOne({
      where: { team: { id: teamId }, user: { id: user.id } }
    });

    if (exists) throw new ConflictException('Этот пользователь уже в команде');

    const member = this.membersRepo.create({ team, user, role });

    return this.membersRepo.save(member);
  }

  async isMember(userId: string, teamId: string): Promise<boolean> {
    const member = await this.membersRepo.findOne({
      where: { user: { id: userId }, team: { id: teamId } }
    });
    return !!member;
  }

  async changeMemberRole(teamId: string, actorId: string, memberId: string, role: TeamRole) {
    const actor = await this.membersRepo.findOne({
      where: { team: { id: teamId }, user: { id: actorId } }
    });

    if (!actor || ![TeamRole.ADMIN, TeamRole.OWNER].includes(actor.role))
      throw new ForbiddenException('Не хватает прав');

    const member = await this.membersRepo.findOne({
      where: { id: memberId },
      relations: ['team']
    });

    if (!member) throw new NotFoundException('Участник не найден');

    member.role = role;

    return this.membersRepo.save(member);
  }

  async removeMember(teamId: string, actorId: string, memberId: string) {
    const actor = await this.membersRepo.findOne({
      where: { team: { id: teamId }, user: { id: actorId } }
    });

    if (!actor || ![TeamRole.ADMIN, TeamRole.OWNER].includes(actor.role))
      throw new ForbiddenException('Не хватает прав');

    const member = await this.membersRepo.findOne({
      where: { id: memberId },
      relations: ['user']
    });

    if (!member) throw new NotFoundException('Участник не найден');

    if (member.role === TeamRole.OWNER)
      throw new ForbiddenException('Нельзя удалить владельца команды');

    await this.membersRepo.delete(member.id);

    return { ok: true };
  }
}
