export type Session = {
  id: string;
  expiresAt: Date;
  fresh: boolean;
  userUUID: string; // userUUID
};

export type User = {
  uuid: string; // userUUID
};
