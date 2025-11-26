import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { ApiResponseFailure, ApiResponseSuccess } from '../types/api-response';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponseFailure | ApiResponseSuccess<T>>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();

    const skip =
      context.getHandler() && Reflect.getMetadata('SKIP_TRANSFORM', context.getHandler());
    if (skip) return next.handle();

    if (req.url === '/api/metrics') {
      return next.handle();
    }

    return next.handle().pipe(
      map((result) => {
        if (result && typeof result === 'object' && 'success' in result) {
          const { message, ...rest } = result;
          return message === undefined || message === null ? rest : result;
        }

        if (result && typeof result === 'object' && ('data' in result || 'message' in result)) {
          const payload = (result as any).data !== undefined ? (result as any).data : undefined;
          const message = (result as any).message;

          if ((result as any).success === false) {
            const res: ApiResponseFailure = {
              data: undefined,
              success: false,
              ...(message !== undefined && message !== null ? { message } : {})
            };
            return res;
          }

          const res: ApiResponseSuccess<typeof payload> = {
            data: payload,
            success: true,
            ...(message !== undefined && message !== null ? { message } : {})
          };
          return res;
        }

        const res: ApiResponseSuccess<typeof result> = {
          data: result,
          success: true
        };
        return res;
      })
    );
  }
}
