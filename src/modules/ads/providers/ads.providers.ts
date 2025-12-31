import { Mongoose } from 'mongoose';

import { DATABASE_CONNECTION } from 'src/config/database/database.constants';
import { AppProvider } from 'src/common/utils/providers.util';
import { AdsSchema } from '../schemas/ads.schema';

export const adsProviders: AppProvider[] = [
  {
    provide: 'ADS_MODEL',
    useFactory: (mongooseInstance: Mongoose) =>
      mongooseInstance.model('ADS', AdsSchema),
    inject: [DATABASE_CONNECTION],
  },
];
