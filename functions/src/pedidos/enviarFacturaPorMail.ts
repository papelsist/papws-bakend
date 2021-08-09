import * as functions from 'firebase-functions';

import * as mailjet from 'node-mailjet';
const publicKey = 'dda57c6f1b05ba91716ad671cac123da';
const privateKey = 'adf9d2d63f72f3ae1aca7c83ceb01855';
const client = mailjet.connect(publicKey, privateKey);

export const enviarFacturaPorMail = functions.https.onCall(
  async (data, context) => {
    const { serie, folio, clienteNombre, target, pdfFile, xmlFile } = data;

    const factura = serie + '-' + folio;
    functions.logger.debug(`Enviando Factura: ${factura} a ${target}`);
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
            Subject: `Factura: ${factura}`,
            TextPart: `Estimado cliente por este medio le hacemos llegar la factura: ${factura}`,
            Attachments: [
              {
                Filename: `${factura}.pdf`,
                ContentType: 'application/pdf',
                Base64Content: pdfFile,
              },
              {
                Filename: `${factura}.xml`,
                ContentType: 'text/xml',
                Base64Content: xmlFile,
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
