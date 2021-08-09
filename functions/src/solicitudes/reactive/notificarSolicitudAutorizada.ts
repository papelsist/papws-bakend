import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { getMessaging } from '../../sdk';

export const notificarSolicitudAutorizada = functions.firestore
  .document('solicitudes/{solicitudId}')
  .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const oldValue = change.before.data();
    const oldStatus = oldValue['status'];
    const newStatus = newValue['status'];

    if (oldStatus === newStatus) {
      return Promise.resolve();
    }

    if (newStatus === 'AUTORIZADO') {
      const uid = newValue.updateUserUid;
      functions.logger.debug('Solicitud AUTORIZADA  : ', newStatus.folio);
      const userRef = admin.firestore().doc(`usuarios/${uid}`);
      const userDoc = await userRef.get();
      const token: string = userDoc.get('token');
      if (token) {
        functions.logger.debug('Notificando  a: ', token);
        return sendNotification(userDoc.data(), 'Solicitud AUTORIZADA', token);
      }
    }
    return Promise.resolve();
  });

function sendNotification(solicitud: any, title: string, token: string) {
  const notification: admin.messaging.Notification = {
    title,
    body: `Folio ${solicitud.folio} (${solicitud.sucursal})`,
  };
  const payload: admin.messaging.Message = {
    notification,
    webpush: {
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
    },
    token,
  };
  return getMessaging().send(payload);
}
