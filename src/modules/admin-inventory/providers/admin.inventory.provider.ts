import { Mongoose } from 'mongoose';

import { DATABASE_CONNECTION } from 'src/config/database/database.constants';
import type { AppProvider } from 'src/common/utils/providers.util';
import { AdminInventorySchema } from '../schema/admin.inventory.schema';

export const adminInventoryProviders: AppProvider[] = [
  {
    provide: 'ADMIN_INVENTORY_MODEL',
    useFactory: (mongooseInstance: Mongoose) =>
      mongooseInstance.model('AdminInventory', AdminInventorySchema),
    inject: [DATABASE_CONNECTION],
  },
];
