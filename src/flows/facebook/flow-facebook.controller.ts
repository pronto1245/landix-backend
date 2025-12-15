import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from '@nestjs/swagger';

import { UpdateFlowFacebookDto } from './dto/update-flow-facebook.dto';
import { FlowFacebookService } from './flow-facebook.service';
import { FacebookPixelResponse } from './types/facebook-pixel.response';

@ApiTags('Flows / Facebook Pixel')
@Controller('flows/:flowId/facebook')
export class FlowFacebookController {
  constructor(private readonly service: FlowFacebookService) {}

  @Put()
  @ApiOperation({
    summary: 'Update Facebook Pixels for flow',
    description: 'Replaces all Facebook Pixels for the specified flow with the provided list'
  })
  @ApiParam({
    name: 'flowId',
    description: 'Flow UUID',
    example: '2f6b6b2e-9c54-4c6a-b8b2-3c4b4b7b4c3a'
  })
  @ApiBody({ type: UpdateFlowFacebookDto })
  @ApiOkResponse({
    description: 'Facebook pixels updated successfully',
    schema: {
      example: { success: true }
    }
  })
  @ApiNotFoundResponse({
    description: 'Flow not found'
  })
  @ApiBadRequestResponse({
    description: 'Validation error'
  })
  update(@Param('flowId') flowId: string, @Body() dto: UpdateFlowFacebookDto) {
    return this.service.update(flowId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get Facebook Pixels for flow',
    description: 'Returns all Facebook Pixels for the specified flow with masked tokens'
  })
  @ApiParam({
    name: 'flowId',
    description: 'Flow UUID',
    example: '2f6b6b2e-9c54-4c6a-b8b2-3c4b4b7b4c3a'
  })
  @ApiOkResponse({
    description: 'Facebook pixels list',
    type: [FacebookPixelResponse]
  })
  @ApiNotFoundResponse({
    description: 'Flow not found'
  })
  get(@Param('flowId') flowId: string) {
    return this.service.get(flowId);
  }
}
