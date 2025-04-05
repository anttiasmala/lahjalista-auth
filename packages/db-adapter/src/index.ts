import { Prisma, PrismaClient } from '@prisma/client';
import { generateId, generateUUID } from '~/packages/auth/src/crypto';
import { Session, User } from '~/packages/shared/types';

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
  createSession: (userUUID: string) => Promise<void>;
  deleteSession: () => Promise<void>;
  setSession: () => Promise<void>;
  getSession: () => Promise<Session>;
  getUserFromSession: () => Promise<User>; // potentially a dangerous function
  getUserAndSessions: () => Promise<[Session, User]>;
  getUserSessions: (userUUID: string) => Promise<Session[]>; // gets all the sessions belonging to a user
  updateSessionExpirationDate: () => Promise<void>;
  deleteUserSessions: () => Promise<void>; // deletes all the sessions belonging to a user
  deleteExpiredSessions: () => Promise<void>;
};

export class PrismaAdapter implements Adapter {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createSession(userUUID: string) {
    await this.prisma.session.create({
      data: {
        uuid: generateUUID(),
        userUUID,
      },
    });
    return;
  }
}

const prisma = new PrismaClient();
