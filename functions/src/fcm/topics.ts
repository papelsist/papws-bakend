import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const subscribeToTopic = functions.https.onCall(
  async (data, context) => {
    functions.logger.debug('Payload: ', data);
    const res = await admin
      .messaging()
      .subscribeToTopic(data.token, data.topic);
    functions.logger.debug('Subscription Res: ', res);
    functions.logger.info('Subscibing: ', data);
    return `Subscribed to topic: ${data.topic}`;
  }
);
export const unsubscribeToTopic = functions.https.onCall(
  async (data, context) => {
    await admin.messaging().unsubscribeFromTopic(data.token, data.topic);
    functions.logger.info('Unsubscibing: ', data);
    return `unsubscribed from topic: ${data.topic}`;
  }
);

export const sendMessageToToken = functions.https.onCall(
  async (data, context) => {
    const title = data.title || 'FCM Test message';
    const body = data.body || 'FCM Notification OK!';
    const notification: admin.messaging.Notification = {
      title,
      body,
    };
    const token = data.token;
    if (!data.token) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'The function must be called with the target TOKEN'
      );
    }
    const payload: admin.messaging.Message = {
      notification,
      webpush: {
        notification: {
          requireInteraction: true,
          vibrate: [200, 100, 200],
          icon:
            'https://firebasestorage.googleapis.com/v0/b/papx-ws-dev.appspot.com/o/FCMImages%2Fcirculo.png?alt=media&token=20183389-e273-4545-96c4-3f9ae50e4128',
        },
      },
      token,
    };
    functions.logger.info('Sending notification to: ', token);
    return admin.messaging().send(payload);
  }
);
