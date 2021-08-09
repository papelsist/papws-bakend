import * as functions from 'firebase-functions';
// import * as admin from 'firebase-admin';

// import { getFirestore } from '../sdk';

export const actualizarPedidoLog = functions.firestore
  .document('solicitudes/{solicitudId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    try {
      functions.logger.debug('Pedido nuevo:', data);
      const update = { atendido: false };
      await snap.ref.update(update);
    } catch (error) {
      functions.logger.error(error);
      return Promise.resolve();
    }
  });
