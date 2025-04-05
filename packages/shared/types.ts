export type Session = {
  uuid: string;
  expiresAt: Date;
  fresh: boolean;
  userUUID: string; // userUUID
};

export type User = {
  uuid: string; // userUUID
};

// hardcoded values of Lahjalista's User
export type LahjalistaUser = {
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
  uuid: string;
  role: string;
};
