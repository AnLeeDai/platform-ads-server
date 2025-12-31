import { SetMetadata } from '@nestjs/common';

import { RESPONSE_MESSAGE_KEY, SKIP_TRANSFORM_KEY } from '../response.types';

/**
 * Custom decorator để set message cho response
 * @example
 * @ResponseMessage('User created successfully')
 * @Post()
 * createUser() { ... }
 */
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);

/**
 * Skip response transformation (trả về raw data, nhưng vẫn áp dụng serialization)
 * @example
 * @SkipTransform()
 * @Get('file')
 * downloadFile() { ... }
 */
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);
