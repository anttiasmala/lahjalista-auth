import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function readDatabase() {
  console.log(
    await prisma.user.findMany({
      where: {
        uuid: 'asd',
      },
    }),
  );
}

async function createUser() {
  const generatedUUID = crypto.randomUUID();
  console.log(generatedUUID);
  await prisma.user.create({
    data: {
      uuid: generatedUUID,
    },
  });
}

await createUser();
await readDatabase();
