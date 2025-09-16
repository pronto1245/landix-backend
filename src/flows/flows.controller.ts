import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/users/enums/role.enum';

import { CreateFlowDto } from './dto/create-flow.dto';
import { Flow } from './entities/flow.entity';
import { FlowsService } from './flows.service';

@ApiTags('Потоки')
@ApiBearerAuth()
@Controller('flows')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FlowsController {
  constructor(private readonly flowService: FlowsService) {}

  @Post()
  @Roles(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Создание нового потока' })
  @ApiBody({ type: CreateFlowDto })
  @ApiResponse({ status: 201, description: 'Поток успешно создан', type: Flow })
  create(@Body() dto: CreateFlowDto) {
    return this.flowService.createFlow(dto);
  }

  @Get()
  @Roles(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Получение списка потоков' })
  @ApiQuery({ name: 'userId', required: false, description: 'ID пользователя' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Активен ли поток', type: Boolean })
  @ApiQuery({ name: 'name', required: false, description: 'Фильтрация по имени' })
  @ApiResponse({ status: 200, description: 'Список потоков', type: [Flow] })
  getAll(@Query() query: { userId?: string; isActive?: boolean; name?: string }) {
    return this.flowService.getFlows(query);
  }

  @Delete(':id')
  @Roles(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Удаление потока' })
  @ApiParam({
    name: 'id',
    description: 'ID потока',
    example: 'b55a3c7f-2a3d-4c1f-8a1a-12b0000a0001'
  })
  @ApiResponse({ status: 200, description: 'Поток успешно удалён' })
  delete(@Param('id') id: string) {
    return this.flowService.deleteFlow(id);
  }
}
