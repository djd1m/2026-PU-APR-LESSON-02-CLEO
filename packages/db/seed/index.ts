import { db, schema } from '../src/index.js';
import { randomUUID } from 'crypto';
import { hashSync } from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');

  await db.insert(schema.users).values({
    id: randomUUID(),
    email: 'test@cleorf.app',
    name: 'Тестовый Пользователь',
    passwordHash: hashSync('test123456', 12),
    age: 22,
    plan: 'free',
    roastsToday: 0,
    referralCode: 'TEST0001',
  }).onConflictDoNothing();

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
