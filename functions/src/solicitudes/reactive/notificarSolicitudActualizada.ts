import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { getMessaging, getFirestore } from '../../sdk';

export const notificarSolicitudActualizada = functions.firestore
  .document('solicitudes/{solicitudId}')
  .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const oldValue = change.before.data();
    const oldStatus = oldValue['status'];
    const newStatus = newValue['status'];

    if (oldStatus === newStatus) {
      return Promise.resolve();
    }
    functions.logger.debug('Solicitud modificada Status: ', newStatus);

    if (newStatus === 'PENDIENTE') {
      return notificarCorrecion(newValue);
    } else if (newStatus === 'RECHAZADO') {
      return notificarRechazo(newValue);
    } else if (newStatus === 'AUTORIZADO') {
      return notificarAutorizado(newValue);
    } else {
      return Promise.resolve();
    }
  });

function notificarCorrecion(solicitud: any) {
  const topic = 'newSolicitudCreated';
  const message: admin.messaging.Message = {
    notification: {
      title: 'Solicitud Actualizada',
      body: `Folio ${solicitud.folio} (${solicitud.sucursal})`,
    },
    webpush: getWebPushOptions(),
    topic,
  };
  functions.logger.debug('Notificando correction al Topic: ', topic);
  return getMessaging().send(message);
}

async function notificarRechazo(solicitud: any) {
  const uid = solicitud.updateUserUid;
  functions.logger.info('Notificando rechazo a: ', uid);

  if (!uid) {
    functions.logger.debug('Solicitud sin UID del usuario que solicita');
    return Promise.resolve();
  }

  const userRef = getFirestore().doc(`usuarios/${uid}`);
  const userDoc = await userRef.get();

  if (userDoc.exists) {
    const token: string = userDoc.get('token');
    if (token) {
      const title = 'SOLICITUD RECHAZADA';
      const body = `Folio ${solicitud.folio} (${solicitud.sucursal})`;
      const message: admin.messaging.Message = {
        notification: {
          body,
          title,
        },
        webpush: getWebPushOptions(),
        token,
      };
      functions.logger.debug('Notificando RECHAZO al token: ', token);
      return getMessaging().send(message);
    }
  } else {
    return Promise.resolve();
  }
}

async function notificarAutorizado(solicitud: any) {
  const uid = solicitud.updateUserUid;
  if (!uid) {
    functions.logger.debug('Solicitud sin UID del usuario que solicita');
    return Promise.resolve();
  }
  functions.logger.info('Notificando AUTORIZADO a: ', uid);
  const userRef = getFirestore().doc(`usuarios/${uid}`);
  const userDoc = await userRef.get();

  if (userDoc.exists) {
    const token: string = userDoc.get('token');
    if (token) {
      const title = 'SOLICITUD AUTORIZADA';
      const body = `Folio ${solicitud.folio} (${solicitud.sucursal})`;
      const message: admin.messaging.Message = {
        notification: {
          body,
          title,
        },
        webpush: getWebPushOptions(),
        token,
      };
      functions.logger.debug('Notificando AUTORIZADO al token: ', token);
      return getMessaging().send(message);
    }
  } else {
    return Promise.resolve();
  }
}

const getWebPushOptions = (): admin.messaging.WebpushConfig => {
  return {
    notification: {
      requireInteraction: true,
      vibrate: [200, 100, 200],
      icon:
        'https://firebasestorage.googleapis.com/v0/b/papx-ws-dev.appspot.com/o/FCMImages%2Fcirculo.png?alt=media&token=20183389-e273-4545-96c4-3f9ae50e4128',
      actions: [],
      fcmOptions: {
        link: 'https://papws-depositos.web.app/autorizaciones/pendientes',
      },
    },
  };
};
