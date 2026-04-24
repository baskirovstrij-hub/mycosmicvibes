import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const jsonPath = path.join(process.cwd(), 'interpretations_seed.json');
  const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(fileContent);

  console.log(`Seeding ${data.length} interpretations...`);

  for (const item of data) {
    await prisma.interpretation.upsert({
      where: { key: item.key },
      update: { content: item.content, category: item.category },
      create: item,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
