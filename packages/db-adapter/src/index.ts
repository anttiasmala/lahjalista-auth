import { Prisma, PrismaClient } from '@prisma/client';
import { generateId, generateUUID } from '~/packages/auth/src/crypto';
import { CreateSession, Session, User } from '~/packages/shared/types';

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
  createSession: (SessionData: CreateSession) => Promise<void>;
  deleteSession: (sessionUUID: string) => Promise<void>;
  setSession: () => Promise<void>;
  getSession: () => Promise<Session>;
  getUserFromSession: () => Promise<User>; // potentially a dangerous function
  getUserAndSessions: () => Promise<[Session[], User]>; // gets the user and ALL the sessions
  getUserAndSession: (
    sessionUUID: string,
  ) => Promise<[Session, LahjalistaUser]>; // gets the user and ONLY ONE session
  getUserSessions: (userUUID: string) => Promise<Session[]>; // gets all the sessions belonging to a ONE user
  updateSessionExpirationDate: (sessionUUID: string, sessionExpirationDate: Date) => Promise<void>; // prettier-ignore
  deleteUserSessions: () => Promise<void>; // deletes all the sessions belonging to a user
  deleteExpiredSessions: () => Promise<void>;
};

export class PrismaAdapter implements Adapter {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createSession(SessionData: CreateSession) {
    await this.prisma.session.create({
      data: SessionData,
    });
    return;
  }
}

const prisma = new PrismaClient();
