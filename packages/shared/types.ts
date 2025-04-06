export type Session = {
  uuid: string;
  expiresAt: Date;
  fresh: boolean;
  userUUID: string; // userUUID
};

export type CreateSession = {
  uuid: string;
  expiresAt: Date;
  userUUID: string;
};

export type User = {
  uuid: string; // userUUID
};

export type DatabaseAdapter = {
  createSession: (sessionData: CreateSession) => Promise<void>;
  deleteSession: (sessionUUID: string) => Promise<void>;
  setSession: () => Promise<void>; // createSession is same
  getSession: () => Promise<Session>;
  getUserFromSession: () => Promise<User>; // potentially a dangerous function
  getUserAndSessions: () => Promise<[Session[], User]>; // gets the user and ALL the sessions
  //prettier-ignore
  getUserAndSession: (sessionUUID: string) => Promise<[Session, LahjalistaUser]>; // gets the user and ONLY ONE session
  getUserSessions: (userUUID: string) => Promise<Session[]>; // gets all the sessions belonging to a ONE user
  // prettier-ignore
  updateSessionExpirationDate: (sessionUUID: string, sessionExpirationDate: Date) => Promise<void>;
  deleteUserSessions: (userUUID: string) => Promise<void>; // deletes all the sessions belonging to a user
  deleteExpiredSessions: () => Promise<void>;
};

// hardcoded values of Lahjalista's User which can be shown to user
// For example, id field is not added here, it'd leak a number of users due to auto-increment
export type LahjalistaUser = {
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
  uuid: string;
  role: string;
};
