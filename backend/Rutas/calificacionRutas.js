const express = require("express");
const router  = express.Router();
const ctrl    = require("../Controladores/calificacionControlador");
const { verificarToken, soloDocente } = require("../Middleware/verificarToken");

router.get("/",                   verificarToken, ctrl.getCalificacionesTodos);
router.get("/:alumnoId",          verificarToken, ctrl.getCalificacionesAlumno);
router.post("/",                  verificarToken, soloDocente, ctrl.guardarCalificacion);

module.exports = router;