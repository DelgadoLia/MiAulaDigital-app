const express = require('express');

const router = express.Router();

const controlador =
  require('../Controladores/mensajeControlador');

router.get(
  '/conversaciones', 
  controlador.obtenerConversaciones
);

router.get(
  '/:id',
  controlador.obtenerMensajes
);

router.post(
  '/',
  controlador.enviarMensaje
);

module.exports = router;