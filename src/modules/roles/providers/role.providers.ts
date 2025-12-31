import { Mongoose } from 'mongoose';

import { DATABASE_CONNECTION } from 'src/config/database/database.constants';
import type { AppProvider } from 'src/common/utils/providers.util';
import { RoleSchema } from '../schema/role.schema';

export const roleProviders: AppProvider[] = [
  {
    provide: 'ROLE_MODEL',
    useFactory: (mongooseInstance: Mongoose) =>
      mongooseInstance.model('Role', RoleSchema),
    inject: [DATABASE_CONNECTION],
  },
];
