import { Prisma, PrismaClient } from '@prisma/client';
import { generateId, generateUUID } from '~/packages/auth/src/crypto';

/*
function createSession() {}
function deleteSession() {}
function getSession() {}
function getUserFromSession() {}
function getUserAndSessions() {}
function getUsersAllSessions() {}
function updateSessionExpirationDate() {}
function deleteUsersAllSessions() {}
function deleteExpiredSessions() {}
*/

declare global {
  var prisma: undefined | PrismaClient; //eslint-disable-line no-var
}

export type Adapter = {
  createSession: (userUUID: string) => {};
  deleteSession: () => {};
  setSession: () => {};
  getSession: () => {};
  getUserFromSession: () => {}; // potentially a dangerous function
  getUserAndSessions: () => {};
  getUserSessions: (userUUID: string) => {}; // gets all the sessions belonging to a user
  updateSessionExpirationDate: () => {};
  deleteUserSessions: () => {}; // deletes all the sessions belonging to a user
  deleteExpiredSessions: () => {};
};

export class PrismaAdapter implements Adapter {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  createSession(userUUID: string) {
    const createdUser = this.prisma.session.create({
      data: {
        uuid: generateUUID(),
        userUUID,
      },
    });
    return createdUser;
  }
}

const prisma = new PrismaClient();
