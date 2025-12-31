import { SetMetadata, Type } from '@nestjs/common';
import { ClassTransformOptions } from 'class-transformer';

/**
 * Decorator to define entity class for serialization
 * Use instead of returning entity instance from controller
 * @example
 * @Serialize(UserEntity)
 * @Get()
 * getUsers() { ... }
 */
export const SERIALIZE_KEY = 'serialize_entity';
export const Serialize = (entity: Type<any>) =>
  SetMetadata(SERIALIZE_KEY, entity);

/**
 * Decorator to customize serialization options
 * @example
 * @SerializeOptions({ excludePrefixes: ['_'] })
 * @Get()
 * getUsers() { ... }
 */
export const SERIALIZE_OPTIONS_KEY = 'serialize_options';
export const SerializeOptions = (options: ClassTransformOptions) =>
  SetMetadata(SERIALIZE_OPTIONS_KEY, options);
