export type Session = {
  uuid: string;
  expiresAt: Date;
  fresh: boolean;
  userUUID: string; // userUUID
};

export type User = {
  uuid: string; // userUUID
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
