import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as mongoose from 'mongoose';

import { AppModule } from 'src/app.module';
import { seedRoles, seedUsers } from './seeds';

async function runSeeds() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const configService = app.get(ConfigService);

  const mongoUri = configService.get<string>('MONGODB_URI');
  const mongoDbName = configService.get<string>('MONGODB_DB_NAME');

  if (!mongoUri) {
    throw new Error('Missing required env var: MONGODB_URI');
  }
  if (!mongoDbName) {
    throw new Error('Missing required env var: MONGODB_DB_NAME');
  }

  try {
    await mongoose.connect(mongoUri, { dbName: mongoDbName });
    await seedRoles(mongoose);
    await seedUsers(mongoose, configService);
  } finally {
    await mongoose.disconnect();
    await app.close();
  }
}

runSeeds()
  .then(() => {
    console.log('Database seeding completed!');
  })
  .catch((err: unknown) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
