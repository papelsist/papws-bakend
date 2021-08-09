import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { getMessaging } from '../../sdk';

export const notificarSolicitudNueva = functions.firestore
  .document('solicitudes/{solicitudId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    try {
      if (data.sucursal === 'OFICINAS') {
        const res = await sendNewSolicitudNotification(data);
        functions.logger.debug('Notificacion de nueva solicitud: ', res);
        return Promise.resolve();
      } else {
        if (data.appVersion === 2) {
          functions.logger.info(
            `Notificando nueva solicitud: ${data.folio} de ${data.sucursal} AppVer: ${data.appVersion}`
          );
          const res = await sendNewSolicitudNotification(data);
          functions.logger.debug('Notificacion de nueva solicitud: ', res);
          return Promise.resolve();
        }
        return Promise.resolve();
      }
    } catch (error) {
      functions.logger.error(error);
      return Promise.resolve();
    }
  });

async function sendNewSolicitudNotification(solicitud: any): Promise<string> {
  const notification: admin.messaging.Notification = {
    title: 'NUEVA SOLICITUD',
    body: `Folio ${solicitud.folio} (${solicitud.sucursal})`,
  };
  const topic = 'newSolicitudCreated';
  const payload: admin.messaging.Message = {
    notification,
    webpush: {
      notification: {
        requireInteraction: true,
        vibrate: [200, 100, 200],
        icon: 'https://firebasestorage.googleapis.com/v0/b/papx-ws-dev.appspot.com/o/FCMImages%2Fcirculo.png?alt=media&token=20183389-e273-4545-96c4-3f9ae50e4128',
      },
      fcmOptions: {
        link: 'https://papws-depositos.web.app/autorizaciones/pendientes',
      },
    },
    topic,
  };
  functions.logger.debug('Sending notification to: ', topic);
  return getMessaging().send(payload);
}
