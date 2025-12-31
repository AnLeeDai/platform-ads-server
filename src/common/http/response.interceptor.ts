import {
  CallHandler,
  ClassSerializerInterceptor,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import type { Request, Response } from 'express';
import { ClassTransformOptions } from 'class-transformer';

import { RESPONSE_MESSAGE_KEY, SKIP_TRANSFORM_KEY } from './response.types';
import { BaseResponseEntity } from '../entities';

@Injectable()
export class ResponseInterceptor extends ClassSerializerInterceptor {
  constructor(reflector: Reflector) {
    super(reflector, {
      strategy: 'excludeAll',
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const reflector = this['reflector'] as Reflector;

    const skipTransform = reflector.getAllAndOverride<boolean>(
      SKIP_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipTransform) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const customMessage = reflector.getAllAndOverride<string>(
      RESPONSE_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const contextOptions = this.getContextOptions(context);
    const options: ClassTransformOptions = {
      ...this.defaultOptions,
      ...contextOptions,
    };

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode || 200;
        const wrappedResponse = new BaseResponseEntity({
          success: true,
          statusCode,
          message: customMessage || this.getDefaultMessage(request.method),
          data,
          timestamp: new Date().toISOString(),
        });

        return this.serialize(wrappedResponse, options);
      }),
    );
  }

  private getDefaultMessage(method: string): string {
    const messages: Record<string, string> = {
      GET: 'Data retrieved successfully',
      POST: 'Data created successfully',
      PUT: 'Data updated successfully',
      PATCH: 'Data updated successfully',
      DELETE: 'Data deleted successfully',
    };

    return messages[method] || 'Request processed successfully';
  }
}
