import { Mongoose } from 'mongoose';

import { DATABASE_CONNECTION } from 'src/config/database/database.constants';
import { PointBalanceSchema, PointHistorySchema } from '../schema/point.schema';
import { AppProvider } from 'src/common/utils/providers.util';

export const pointProviders: AppProvider[] = [
  {
    provide: 'POINT_BALANCE_MODEL',
    useFactory: (mongooseInstance: Mongoose) =>
      mongooseInstance.model('PointBalance', PointBalanceSchema),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: 'POINT_HISTORY_MODEL',
    useFactory: (mongooseInstance: Mongoose) =>
      mongooseInstance.model('PointHistory', PointHistorySchema),
    inject: [DATABASE_CONNECTION],
  },
];
