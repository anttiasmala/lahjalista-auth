import { Prisma, PrismaClient } from '@prisma/client';
import { generateId, generateUUID } from '~/packages/auth/src/crypto';
import {
  CreateSession,
  DatabaseAdapter,
  Session,
  User,
} from '~/packages/shared/types';

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
}

const prisma = new PrismaClient();
