import * as functions from 'firebase-functions';

import * as mailjet from 'node-mailjet';
const publicKey = 'dda57c6f1b05ba91716ad671cac123da';
const privateKey = 'adf9d2d63f72f3ae1aca7c83ceb01855';
const client = mailjet.connect(publicKey, privateKey);

export const enviarPedidoPorMail = functions.https.onCall(
  async (data, context) => {
    const { target, pdfFile, pedidoFolio, clienteNombre, tipo } = data;
    // const { target, pedidoFolio, clienteNombre } = data;
    const stipo = tipo ?? 'COTIZACION';

    functions.logger.debug(`Enviando ${tipo} a ${target}`);
    try {
      const request = client.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'luxsoft.cancino@gmail.com',
              Name: 'Papel Callcenter',
            },
            To: [
              {
                Email: target,
                Name: clienteNombre,
              },
            ],
            Subject: `${
              stipo === 'COTIZACION' ? 'Cotización:' : 'Pedido: '
            } ${pedidoFolio}`,
            TextPart: `Estimado cliente por este medio le hacemos llegar la ${stipo} del material solicitado`,
            Attachments: [
              {
                Filename: `Pedido_${pedidoFolio}.pdf`,
                ContentType: 'application/pdf',
                Base64Content: pdfFile,
              },
            ],
          },
        ],
      });
      const response = await request;
      functions.logger.info('Envio exitoso: ', response.body);
      return response.body;
    } catch (err) {
      functions.logger.error('Error enviando correo: ', err);
      return { error: err };
    }
  }
);
