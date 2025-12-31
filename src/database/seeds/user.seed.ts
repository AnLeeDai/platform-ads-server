import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

import { UserSchema, UserDocument } from 'src/modules/users/schema/user.schema';
import { RoleSchema } from 'src/modules/roles/schema/role.schema';
import {
  PointBalanceSchema,
  PointHistorySchema,
} from 'src/modules/point/schema/point.schema';

type UserSeedData = {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  roles: Array<{ _id: mongoose.Types.ObjectId; name: string }>;
  createdAt: Date;
  updatedAt: Date;
};

export function createAdminUserSeedData(
  configService: ConfigService,
): Omit<UserSeedData, 'roles'> | null {
  const username = configService.get<string>('ADMIN_USERNAME') ?? '';
  const email = configService.get<string>('ADMIN_EMAIL') ?? '';
  const phoneNumber = configService.get<string>('ADMIN_PHONE') ?? '';
  const password = configService.get<string>('ADMIN_PASSWORD') ?? '';

  if (!username || !email || !phoneNumber || !password) {
    return null;
  }

  return {
    username,
    email,
    phoneNumber,
    password,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function seedUsers(
  connection: typeof mongoose,
  configService: ConfigService,
) {
  const adminUser = createAdminUserSeedData(configService);
  if (!adminUser) {
    return;
  }

  const RoleModel = connection.model('roles', RoleSchema);
  const UserModel = connection.model<UserDocument>('users', UserSchema);

  const adminRole = await RoleModel.findOne({ name: 'admin' });
  if (!adminRole) {
    throw new Error(
      'Missing required role in DB: admin. Run role seed first (seedRoles) or create the role manually.',
    );
  }

  const existing = await UserModel.findOne({
    $or: [{ username: adminUser.username }, { email: adminUser.email }],
  });

  const PointBalanceModel = connection.model(
    'PointBalance',
    PointBalanceSchema,
  );
  const PointHistoryModel = connection.model(
    'PointHistory',
    PointHistorySchema,
  );

  if (existing) {
    const hasBalance = await PointBalanceModel.exists({ userId: existing._id });
    if (!hasBalance) {
      await PointBalanceModel.create({
        userId: existing._id,
        balance: 99999,
      });

      await PointHistoryModel.create({
        userId: existing._id,
        amount: 99999,
        balanceBefore: 0,
        balanceAfter: 99999,
        description: 'Initial admin points',
        type: 'ADMIN-BONUS',
      });
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(adminUser.password, 10);

  const createdAdmin = await UserModel.create({
    ...adminUser,
    password: hashedPassword,
    roles: [{ _id: adminRole._id, name: adminRole.name }],
  });

  await PointBalanceModel.create({
    userId: createdAdmin._id,
    balance: 99999,
  });

  await PointHistoryModel.create({
    userId: createdAdmin._id,
    amount: 99999,
    balanceBefore: 0,
    balanceAfter: 99999,
    description: 'Initial admin points',
    type: 'ADMIN-BONUS',
  });
}
