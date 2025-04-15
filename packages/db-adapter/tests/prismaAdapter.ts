import { generateUUID } from '~/packages/auth/src/crypto';
import { DatabaseAdapter } from '~/packages/shared/types';

/*
export type DatabaseAdapter = {
  createSession: (sessionData: CreateSession) => Promise<DatabaseSession | null>;
  deleteSession: (sessionUUID: string) => Promise<void>;
  getUserAndSession: (sessionUUID: string) => Promise<GetUserAndSessionResult>; // gets the user and ONLY ONE session
  getUserSessions: (userUUID: string) => Promise<DatabaseSession[]>; // gets all the sessions belonging to a ONE user
  updateSessionExpirationDate: (sessionUUID: string, newSessionExpirationDate: Date) => Promise<void>;
  deleteUserSessions: (userUUID: string) => Promise<void>; // deletes all the sessions belonging to a user
  deleteExpiredSessions: () => Promise<void>;
};
*/

let SESSION_UUID: string;

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export async function adapterTest(adapter: DatabaseAdapter, userUUID: string) {
  // createSession
  try {
    console.log('Running createSession!');
    SESSION_UUID = generateUUID();
    await adapter.createSession({
      userUUID,
      expiresAt: new Date(Date.now() + Date.now()),
      uuid: SESSION_UUID,
    });
    console.log('createSession: no errors!');
  } catch (e) {
    console.error(e, '\n\n\ncreateSession: error occured');
    return;
  }

  await sleep(10000);

  // getUserAndSession
  try {
    console.log('Running getUserAndSession!');
    const userAndSession = await adapter.getUserAndSession(SESSION_UUID);
    console.log(userAndSession);
    console.log('getUserAndSession: no errors!');
  } catch (e) {
    console.error(e, '\n\n\ngetUserAndSession: error occured');
    return;
  }

  await sleep(10000);

  // getUserAndSession
  try {
    console.log('Running getUserAndSessions!');
    let userAndSessions = await adapter.getUserAndSessions(userUUID);
    console.log(userAndSessions);
    await adapter.createSession({
      userUUID,
      expiresAt: new Date(Date.now() + Date.now()),
      uuid: generateUUID(),
    });
    userAndSessions = await adapter.getUserAndSessions(userUUID);
    console.log(userAndSessions);
    console.log('getUserAndSessions: no errors!');
  } catch (e) {
    console.error(e, '\n\n\ngetUserAndSessions: error occured');
    return;
  }

  await sleep(10000);

  // updateSessionExpirationDate
  try {
    console.log('Running updateSessionExpirationDate!');
    console.log(adapter.getSession(SESSION_UUID));
    await adapter.updateSessionExpirationDate(
      SESSION_UUID,
      new Date(Date.now() * 3 - 100),
    );
    console.log(adapter.getSession(SESSION_UUID));
    console.log('updateSessionExpirationDate: no errors!');
  } catch (e) {
    console.error(e, '\n\n\nupdateSessionExpirationDate: error occured');
    return;
  }

  await sleep(10000);

  // deleteExpiredSessions
  try {
    console.log('Running deleteExpiredSessions!');
    console.log(await adapter.getUserAndSessions(userUUID));
    await adapter.createSession({
      userUUID,
      expiresAt: new Date(Date.now() - 100_000),
      uuid: generateUUID(),
    });
    console.log(await adapter.getUserAndSessions(userUUID));
    await adapter.deleteExpiredSessions();
    console.log(await adapter.getUserAndSessions(userUUID));
    console.log('deleteExpiredSessions: no errors!');
  } catch (e) {
    console.error(e, '\n\n\ndeleteExpiredSessions: error occured');
    return;
  }

  await sleep(10000);

  // deleteSession
  try {
    console.log('Running deleteSession!');
    const _sessionUUID = generateUUID();
    console.log(await adapter.getUserAndSessions(userUUID));
    await adapter.createSession({
      userUUID,
      expiresAt: new Date(Date.now() - 100_000),
      uuid: _sessionUUID,
    });
    await adapter.deleteSession(_sessionUUID);
    console.log(await adapter.getUserAndSessions(userUUID));
    console.log('deleteSession: no errors!');
  } catch (e) {
    console.error(e, '\n\n\ndeleteSession: error occured');
    return;
  }

  await sleep(10000);

  // deleteUserSessions
  try {
    console.log('Running deleteUserSessions!');
    for (let x = 0; x < 10; x++) {
      await adapter.createSession({
        userUUID,
        expiresAt: new Date(),
        uuid: generateUUID(),
      });
      console.log(x);
    }
    console.log(await adapter.getUserAndSessions(userUUID));

    await adapter.deleteUserSessions(userUUID);
    console.log(await adapter.getUserAndSessions(userUUID));
    console.log('deleteUserSessions: no errors!');
  } catch (e) {
    console.error(e, '\n\n\ndeleteUserSessions: error occured');
    return;
  }

  return;
}

export async function adapterTest_v2(
  adapter: DatabaseAdapter,
  userUUID: string,
) {
  try {
    SESSION_UUID = generateUUID();
    console.log(
      await adapter.createSession({
        userUUID,
        expiresAt: new Date(),
        uuid: SESSION_UUID,
      }),
    );
    await sleep(1000);
    console.log(await adapter.getUserFromSession(SESSION_UUID));
    await sleep(1000);
    console.log(await adapter.getUserAndSessions(userUUID));
    await sleep(3000);
    await adapter.deleteUserSessions(userUUID);
    await sleep(3000);
    console.log(await adapter.getUserAndSessions(userUUID));
  } catch (e) {
    console.error(e);
  }
}
