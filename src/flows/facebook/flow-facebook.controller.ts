import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { UpdateFlowFacebookDto } from './dto/update-flow-facebook.dto';
import { FlowFacebookService } from './flow-facebook.service';
import { FacebookPixelResponse } from './types/facebook-pixel.response';

@ApiTags('Flows / Facebook Pixel')
@Controller('flows/:flowId/facebook')
export class FlowFacebookController {
  constructor(private readonly service: FlowFacebookService) {}

  @Put()
  @ApiOperation({
    summary: 'Обновить список Facebook Pixels'
  })
  @ApiParam({
    name: 'flowId',
    description: 'Flow UUID',
    example: '2f6b6b2e-9c54-4c6a-b8b2-3c4b4b7b4c3a'
  })
  @ApiBody({ type: UpdateFlowFacebookDto })
  @ApiOkResponse({
    description: 'Facebook Pixels обновлены',
    schema: {
      example: { success: true }
    }
  })
  update(@Param('flowId') flowId: string, @Body() dto: UpdateFlowFacebookDto) {
    return this.service.update(flowId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список Facebook Pixels'
  })
  @ApiParam({
    name: 'flowId',
    description: 'Flow UUID',
    example: '2f6b6b2e-9c54-4c6a-b8b2-3c4b4b7b4c3a'
  })
  @ApiOkResponse({
    description: 'Список Facebook Pixels',
    type: [FacebookPixelResponse]
  })
  get(@Param('flowId') flowId: string) {
    return this.service.get(flowId);
  }
}
