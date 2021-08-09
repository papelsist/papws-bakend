export const sendEmail = (message: any) => {
  const publicKey = 'dda57c6f1b05ba91716ad671cac123da';
  const privateKey = 'adf9d2d63f72f3ae1aca7c83ceb01855';
  const mailjet = require('node-mailjet').connect(publicKey, privateKey);
  const request = mailjet.post('send', { version: 'v3.1' }).request(message);
  return request;
};
