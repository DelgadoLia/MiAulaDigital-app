const express = require('express');

const router = express.Router();

const avisoControlador =
  require('../Controladores/avisoControlador');

router.get(
  '/',
  avisoControlador.obtenerAvisos
);

router.post(
  '/',
  avisoControlador.crearAviso
);

router.delete(
  '/:id',
  avisoControlador.eliminarAviso
);

module.exports = router;