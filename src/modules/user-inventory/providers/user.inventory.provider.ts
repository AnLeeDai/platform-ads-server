import { Mongoose } from 'mongoose';

import { DATABASE_CONNECTION } from 'src/config/database/database.constants';
import { AppProvider } from 'src/common/utils/providers.util';
import { UserInventorySchema } from '../schema/user.inventory.schema';

export const userInventoryProviders: AppProvider[] = [
  {
    provide: 'USER_INVENTORY_MODEL',
    useFactory: (mongooseInstance: Mongoose) =>
      mongooseInstance.model('UserInventory', UserInventorySchema),
    inject: [DATABASE_CONNECTION],
  },
];
