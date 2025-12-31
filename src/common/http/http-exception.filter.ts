import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import type { ApiErrorResponse } from './response.types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const code = isHttpException
      ? (HttpStatus[status] ?? 'HTTP_EXCEPTION')
      : 'INTERNAL_SERVER_ERROR';

    const payload = isHttpException ? exception.getResponse() : undefined;

    let message = 'Internal server error';
    let details: unknown = undefined;

    if (typeof payload === 'string') {
      message = payload;
    } else if (payload && typeof payload === 'object') {
      const anyPayload = payload as Record<string, unknown>;
      const maybeMessage = anyPayload.message;
      message =
        typeof maybeMessage === 'string'
          ? maybeMessage
          : Array.isArray(maybeMessage)
            ? maybeMessage.join(', ')
            : message;
      details = anyPayload;
    } else if (exception instanceof Error) {
      message = exception.message || message;
    }

    const body: ApiErrorResponse = {
      success: false,
      statusCode: status,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(body);
  }
}
