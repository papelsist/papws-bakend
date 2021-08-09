import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { getFirestore } from '../../sdk';

const firestore = getFirestore();

export const createUser = functions.https.onCall(async (data, context) => {
  functions.logger.info('Registrando un nuevo usuario: ', data);
  const { email, password, displayName } = data;
  try {
    const user = await admin.auth().createUser({
      email,
      password,
      emailVerified: false,
      displayName,
      disabled: false,
    });
    const uid = user.uid;
    const createUserUid = context.auth?.uid;
    const payload = {
      ...data,
      uid,
      createUserUid,
      dateCreated: admin.firestore.Timestamp.now(),
    };
    await firestore.collection('usuarios').doc(uid).set(payload);
    return user.toJSON();
  } catch (error) {
    const message = error.message;
    functions.logger.error(error.code, message);
    throw new functions.https.HttpsError('internal', message);
  }
});
