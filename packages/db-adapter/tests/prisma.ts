import { PrismaClient } from '@prisma/client';
import { adapterTest } from './prismaAdapter';
import { PrismaAdapter } from '../src';

const prisma = new PrismaClient();
const prismaAdapter = new PrismaAdapter(prisma);

async function readDatabase() {
  console.log(await prisma.user.findMany({}));
}
const generatedUUID = crypto.randomUUID().toString();

async function testRun() {
  await createUser();

  await adapterTest(prismaAdapter, generatedUUID);

  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}

async function createUser() {
  await prisma.user.create({
    data: {
      email: `testi.teppo${generatedUUID}@teppo.com`,
      firstName: 'Teppo',
      lastName: 'Testi',
      password: '123',
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

await testRun();

/*
await readDatabase();
await createUser();
await readDatabase();
//await deleteUser(generatedUUID);
await readDatabase();
*/
