import { TimeSpan, createDate, isWithinExpirationDate } from './date';
import { CookieController } from './cookie';
import { generateIdFromEntropySize, generateUUID } from './crypto';

import type { Cookie, CookieAttributes } from './cookie';

import { PrismaAdapter } from '~/packages/db-adapter/src';
import type { Adapter } from '~/packages/db-adapter/src';
import { Session, User, LahjalistaUser } from '~/packages/shared/types';

export class LahjaListaAuth {
  private adapter: Adapter;
  private sessionExpiresIn: TimeSpan;
  private sessionCookieController: CookieController;

  public readonly sessionCookieName: string;

  constructor(
    adapter: Adapter,
    options?: {
      sessionExpiresIn?: TimeSpan;
      sessionCookie?: SessionCookieOptions;
    },
  ) {
    this.adapter = adapter;

    this.sessionExpiresIn = options?.sessionExpiresIn ?? new TimeSpan(30, 'd');
    this.sessionCookieName = options?.sessionCookie?.name ?? 'auth_session';

    let sessionCookieExpiresIn = this.sessionExpiresIn;
    if (options?.sessionCookie?.expires === false) {
      sessionCookieExpiresIn = new TimeSpan(400, 'd');
    }
    const baseSessionCookieAttributes: CookieAttributes = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      ...options?.sessionCookie?.attributes,
    };
    this.sessionCookieController = new CookieController(
      this.sessionCookieName,
      baseSessionCookieAttributes,
      {
        expiresIn: sessionCookieExpiresIn,
      },
    );
  }

  /** **Gets all the NON-EXPIRED sessions of a user has and returns them** */
  public async getUserSessions(userUUID: string): Promise<Session[]> {
    const databaseSessions = await this.adapter.getUserSessions(userUUID);
    const sessions: Session[] = [];
    for (const databaseSession of databaseSessions) {
      // session is expired, don't add it into sessions array
      if (!isWithinExpirationDate(databaseSession.expiresAt)) {
        continue;
      }

      sessions.push({
        uuid: databaseSession.uuid,
        expiresAt: databaseSession.expiresAt,
        userUUID: databaseSession.userUUID,
        fresh: false,
      });
    }
    return sessions;
  }

  /** **Checks if session is valid and can let user in** */
  public async validateSession(
    sessionUUID: string,
  ): Promise<
    { user: LahjalistaUser; session: Session } | { user: null; session: null }
  > {
    const [databaseSession, databaseUser] =
      await this.adapter.getUserAndSession(sessionUUID);
    if (!databaseSession) {
      return { session: null, user: null };
    }
    if (!databaseUser) {
      await this.adapter.deleteSession(databaseSession.uuid);
      return { session: null, user: null };
    }
    if (!isWithinExpirationDate(databaseSession.expiresAt)) {
      await this.adapter.deleteSession(databaseSession.uuid);
      return { session: null, user: null };
    }
    const activePeriodExpirationDate = new Date(
      databaseSession.expiresAt.getTime() -
        this.sessionExpiresIn.milliseconds() / 2,
    );
    const session: Session = {
      uuid: databaseSession.uuid,
      userUUID: databaseSession.userUUID,
      fresh: false,
      expiresAt: databaseSession.expiresAt,
    };
    if (!isWithinExpirationDate(activePeriodExpirationDate)) {
      session.fresh = true;
      session.expiresAt = createDate(this.sessionExpiresIn);
      await this.adapter.updateSessionExpirationDate(
        databaseSession.uuid,
        session.expiresAt,
      );
    }
    const user: LahjalistaUser = databaseUser;
    return { user, session };
  }

  public async createSession(
    userUUID: string,
    options?: {
      sessionUUID?: string;
    },
  ): Promise<Session> {
    const sessionUUID = options?.sessionUUID ?? generateUUID();
    const sessionExpiresAt = createDate(this.sessionExpiresIn);
    await this.adapter.createSession({
      uuid: sessionUUID,
      expiresAt: sessionExpiresAt,
      userUUID,
    });
    const session: Session = {
      userUUID,
      uuid: sessionUUID,
      fresh: true,
      expiresAt: sessionExpiresAt,
    };
    return session;
  }

  public async invalidateSession(sessionId: string): Promise<void> {
    await this.adapter.deleteSession(sessionId);
  }

  public async invalidateUserSessions(userId: UserId): Promise<void> {
    await this.adapter.deleteUserSessions(userId);
  }

  public async deleteExpiredSessions(): Promise<void> {
    await this.adapter.deleteExpiredSessions();
  }

  public readSessionCookie(cookieHeader: string): string | null {
    const sessionId = this.sessionCookieController.parse(cookieHeader);
    return sessionId;
  }

  public readBearerToken(authorizationHeader: string): string | null {
    const [authScheme, token] = authorizationHeader.split(' ') as [
      string,
      string | undefined,
    ];
    if (authScheme !== 'Bearer') {
      return null;
    }
    return token ?? null;
  }

  public createSessionCookie(sessionId: string): Cookie {
    return this.sessionCookieController.createCookie(sessionId);
  }

  public createBlankSessionCookie(): Cookie {
    return this.sessionCookieController.createBlankCookie();
  }
}

export interface SessionCookieOptions {
  name?: string;
  expires?: boolean;
  attributes?: SessionCookieAttributesOptions;
}

export interface SessionCookieAttributesOptions {
  sameSite?: 'lax' | 'strict' | 'none';
  domain?: string;
  path?: string;
  secure?: boolean;
}
