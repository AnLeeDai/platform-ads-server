import { Mongoose } from 'mongoose';

import { DATABASE_CONNECTION } from 'src/config/database/database.constants';
import { UserSchema } from '../schema/user.schema';
import { AppProvider } from 'src/common/utils/providers.util';

export const userProviders: AppProvider[] = [
  {
    provide: 'USER_MODEL',
    useFactory: (mongooseInstance: Mongoose) =>
      mongooseInstance.model('User', UserSchema),
    inject: [DATABASE_CONNECTION],
  },
];
