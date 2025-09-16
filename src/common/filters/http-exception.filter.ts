import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Response } from 'express';

import type { ApiResponseFailure } from '../types/api-response';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const excResponse = exception.getResponse();
      if (typeof excResponse === 'string') {
        message = excResponse;
      } else if (typeof excResponse === 'object' && excResponse !== null) {
        const m = (excResponse as Record<string, any>)?.message;
        if (Array.isArray(m)) message = m.join(', ');
        else if (typeof m === 'string') message = m;
        else if (typeof (excResponse as any).error === 'string') {
          message = (excResponse as any).error;
        } else {
          message = JSON.stringify(excResponse);
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `Exception on ${req?.url}`,
      exception instanceof Error ? exception.stack : String(exception)
    );

    const payload: ApiResponseFailure = {
      data: undefined,
      message,
      success: false
    };

    res.status(status).json(payload);
  }
}
