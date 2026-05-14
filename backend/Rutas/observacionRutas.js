const express = require("express");
const router  = express.Router();
const ctrl    = require("../Controladores/observacionControlador");
const { verificarToken } = require("../Middleware/verificarToken");

router.get("/",    verificarToken, ctrl.getAll);
router.post("/",   verificarToken, ctrl.crear);
router.delete("/:id", verificarToken, ctrl.eliminar);

module.exports = router;