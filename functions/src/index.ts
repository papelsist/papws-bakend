// import * as functions from 'firebase-functions';

import {
  subscribeToTopic,
  unsubscribeToTopic,
  sendMessageToToken,
} from './fcm/topics';
import { notificarSolicitudNueva } from './solicitudes/reactive/notificarSolicitudNueva';
import { notificarSolicitudActualizada } from './solicitudes/reactive/notificarSolicitudActualizada';
// import { notificarSolicitudAutorizada } from './solicitudes/reactive/notificarSolicitudAutorizada';

import { createUser } from './users/restful/createUser';
import {
  fetchUsers,
  fetchUserInfo,
  updateUserRoles,
  updateUserPassword,
  updateUserProfile,
} from './users/restful/fetchUsers';

import { enviarPedidoPorMail } from './pedidos/enviarPorCorreo';
import { enviarFacturaPorMail } from './pedidos/enviarFacturaPorMail';
import { actualizarPedidoLog } from './pedidos/actualizarPedidoLog';
// import * as admin from 'firebase-admin';
// admin.initializeApp();

exports.subscribeToTopic = subscribeToTopic;
exports.unsubscribeToTopic = unsubscribeToTopic;
exports.sendMessageToToken = sendMessageToToken;

exports.notificarSolicitudNueva = notificarSolicitudNueva;
exports.notificarSolicitudActualizada = notificarSolicitudActualizada;
// exports.notificarSolicitudAutorizada = notificarSolicitudAutorizada;

// Usuarios
exports.createUser = createUser;
exports.fetchUsers = fetchUsers;
exports.fetchUserInfo = fetchUserInfo;
exports.updateUserRoles = updateUserRoles;
exports.updateUserPassword = updateUserPassword;
exports.updateUserProfile = updateUserProfile;

// Pedidos
// exports.enviarPedidoPorCorre = enviarPedidoPorCorre;
exports.enviarPedidoPorMail = enviarPedidoPorMail;
exports.enviarFacturaPorMail = enviarFacturaPorMail;
exports.actualizarPedidoLog = actualizarPedidoLog;
