import { RoleSchema } from 'src/modules/roles/schema/role.schema';

export const ROLE_SEED_DATA = [
  {
    name: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function seedRoles(connection: typeof import('mongoose')) {
  const RoleModel = connection.model('Role', RoleSchema);

  const existingCount = await RoleModel.countDocuments();
  if (existingCount > 0) {
    return;
  }

  await RoleModel.insertMany(ROLE_SEED_DATA);
}
