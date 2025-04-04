import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function readDatabase() {
  console.log(await prisma.user.findMany({}));
}
const generatedUUID = crypto.randomUUID();

async function createUser() {
  console.log(generatedUUID);
  await prisma.user.create({
    data: {
      uuid: generatedUUID,
    },
  });
}

async function deleteUser(uuid: string) {
  await prisma.user.delete({
    where: {
      uuid,
    },
  });
}

await createUser();
await readDatabase();
await deleteUser(generatedUUID);
await readDatabase();
