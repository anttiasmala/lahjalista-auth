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
    this.prisma = prisma;
  }

  async createSession(sessionData: CreateSession) {
    await this.prisma.session.create({
      data: sessionData,
    });
    return;
  }
}

const prisma = new PrismaClient();
