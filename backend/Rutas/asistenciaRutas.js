const express = require("express");
const router  = express.Router();
const ctrl    = require("../Controladores/asistenciaControlador");
const { verificarToken, soloDocente } = require("../Middleware/verificarToken");

router.get("/resumen",      verificarToken, ctrl.getResumenTodos);        // ← primero
router.get("/",             verificarToken, ctrl.getAsistenciaPorFecha);
router.post("/",            verificarToken, soloDocente, ctrl.registrarMasiva);
router.get("/:alumnoId",    verificarToken, ctrl.getAsistenciaAlumno);    // ← al final

module.exports = router;