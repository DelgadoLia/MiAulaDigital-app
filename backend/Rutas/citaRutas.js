const express = require('express');
const router = express.Router();

const ctrl = require('../Controladores/citaControlador');
const { verificarToken } = require('../Middleware/verificarToken');

router.get('/', verificarToken, ctrl.obtenerCitas);

router.post('/', verificarToken, ctrl.crearCita);

router.put('/:id/confirmar', verificarToken, ctrl.confirmarCita);

router.delete('/:id', verificarToken, ctrl.eliminarCita);

module.exports = router;