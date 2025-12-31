import * as mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { DATABASE_CONNECTION } from './database.constants';
import type { AppProvider } from 'src/common/utils/providers.util';

export const databaseProviders: AppProvider[] = [
  {
    provide: DATABASE_CONNECTION,
    inject: [ConfigService],
    useFactory: async (
      configService: ConfigService,
    ): Promise<mongoose.Mongoose> => {
      const mongoUri = configService.get<string>('MONGODB_URI');
      const mongoDbName = configService.get<string>('MONGODB_DB_NAME');
      if (!mongoUri) {
        throw new Error('Missing required env var: MONGODB_URI');
      }
      if (!mongoDbName) {
        throw new Error('Missing required env var: MONGODB_DB_NAME');
      }

      return mongoose.connect(mongoUri, { dbName: mongoDbName });
    },
  },
];
