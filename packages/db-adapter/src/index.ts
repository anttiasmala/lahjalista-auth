import { Prisma, PrismaClient } from '@prisma/client';
import { generateId, generateUUID } from '~/packages/auth/src/crypto';
import {
  CreateSession,
  DatabaseAdapter,
  Session,
  User,
} from '~/packages/shared/types';

/*
createSession: (sessionData: CreateSession) => Promise<void>;
deleteSession: (sessionUUID: string) => Promise<void>;
setSession: () => Promise<void>; // createSession is same
getSession: (sessionUUID: string) => Promise<Session | null>;
//prettier-ignore
getUserFromSession: (sessionUUID: string) => Promise<LahjalistaUser>; // potentially a dangerous function
// prettier-ignore
getUserAndSessions: (sessionUUID: string) => Promise<[Session[], LahjalistaUser]>; // gets the user and ALL the sessions
//prettier-ignore
getUserAndSession: (sessionUUID: string) => Promise<[Session, LahjalistaUser]>; // gets the user and ONLY ONE session
getUserSessions: (userUUID: string) => Promise<Session[]>; // gets all the sessions belonging to a ONE user
// prettier-ignore
updateSessionExpirationDate: (sessionUUID: string, sessionExpirationDate: Date) => Promise<void>;
deleteUserSessions: (userUUID: string) => Promise<void>; // deletes all the sessions belonging to a user
deleteExpiredSessions: () => Promise<void>;
*/

declare global {
  var prisma: undefined | PrismaClient; //eslint-disable-line no-var
}

export class PrismaAdapter implements DatabaseAdapter {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma ?? new PrismaClient();
  }

  async createSession(sessionData: CreateSession): Promise<void> {
    const { expiresAt, userUUID, uuid } = sessionData;
    await this.prisma.session.create({
      data: {
        uuid,
        userUUID,
        expiresAt,
      },
    });
    return;
  }

  async deleteSession(sessionUUID: string): Promise<void> {
    await this.prisma.session.delete({
      where: {
        uuid: sessionUUID,
      },
    });
    return;
  }

  async getSession(sessionUUID: string): Promise<Session | null> {
    const session = await this.prisma.session.findFirst({
      where: { uuid: sessionUUID },
      select: {
        uuid: true,
        expiresAt: true,
        userUUID: true,
      },
    });

    if (session) {
      return { fresh: false, ...session };
    }
    return null;
  }

  /** **Potentially a risky function** */
  async getUserFromSession(
    sessionUUID: string,
  ): Promise<LahjalistaUser | null> {
    const session = await this.prisma.session.findFirst({
      where: {
        uuid: sessionUUID,
      },
      select: {
        User: true,
      },
    });

    if (!session || !session.User) return null;

    return session.User;
  }
}

const prisma = new PrismaClient();
