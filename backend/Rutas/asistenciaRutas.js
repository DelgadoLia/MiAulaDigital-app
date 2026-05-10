const express = require("express");
const router  = express.Router();
const ctrl    = require("../Controladores/asistenciaControlador");
const { verificarToken, soloDocente } = require("../Middleware/verificarToken");

router.get("/",             verificarToken, ctrl.getAsistenciaPorFecha);
router.get("/:alumnoId",    verificarToken, ctrl.getAsistenciaAlumno);
router.post("/",            verificarToken, soloDocente, ctrl.registrarMasiva);

module.exports = router;