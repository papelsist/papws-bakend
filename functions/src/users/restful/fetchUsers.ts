import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { getAuth, getFirestore } from '../../sdk';

export const fetchUsers = functions.https.onCall(async (data, context) => {
  return getAuth().listUsers();
});

export const fetchUserInfo = functions.https.onCall(async (data, context) => {
  const { uid } = data;
  functions.logger.debug('Fetching credentials for: ', uid);
  try {
    const userRecord = await getAuth().getUser(uid);
    return userRecord.toJSON();
  } catch (error) {
    console.error('Papws error: ', error);
    functions.logger.error('Papws error: ', error);
    throw new functions.https.HttpsError('unknown', error.message, error);
  }
});

export const updateUserRoles = functions.https.onCall(async (data, context) => {
  const { uid, roles } = data;
  functions.logger.debug('Actualiando custom claims para: ', uid);
  try {
    await getAuth().setCustomUserClaims(uid, roles);
    const docRef = getFirestore().doc(`usuarios/${uid}`);
    const snap = await docRef.get();
    if (snap.exists) {
      await docRef.update({
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        updateType: 'DERECHOS MODIFIED',
        roles,
      });
    }
    return { message: 'Roles actualizados' };
  } catch (error) {
    functions.logger.error('Papws error: ', error);
    throw new functions.https.HttpsError('unknown', error.message, error);
  }
});

export const updateUserPassword = functions.https.onCall(
  async (data, context) => {
    const { uid, password } = data;
    functions.logger.debug('Actualiando custom claims para: ', uid);
    try {
      const record = await getAuth().updateUser(uid, { password });

      // Update user info
      const docRef = getFirestore().doc(`usuarios/${uid}`);
      const snap = await docRef.get();
      if (snap.exists) {
        await docRef.update({
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          updateType: 'CONTRASEÑA MODIFICADA',
        });
      }

      return record;
    } catch (error) {
      functions.logger.error('Papws error: ', error);
      throw new functions.https.HttpsError('unknown', error.message, error);
    }
  }
);

export const updateUserProfile = functions.https.onCall(
  async (data, context) => {
    const { uid, changes } = data;
    functions.logger.debug('Actualizando user profile para: ', uid);
    functions.logger.debug('Profile: ', changes);
    try {
      const record = await getAuth().updateUser(uid, changes);
      functions.logger.debug('User profile updated OK...');
      return record;
    } catch (error) {
      functions.logger.error('Papws error: ', error);
      throw new functions.https.HttpsError('unknown', error.message, error);
    }
  }
);
