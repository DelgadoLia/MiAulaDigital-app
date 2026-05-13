const express = require('express');

const router = express.Router();

const ctrl =
  require('../Controladores/aseoControlador');

router.get('/',
  ctrl.getAseo
);

router.post('/',
  ctrl.saveAseo
);

module.exports = router;