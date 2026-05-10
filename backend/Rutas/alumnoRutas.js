const express = require("express");
const router  = express.Router();
const ctrl    = require("../Controladores/alumnoControlador");
const { verificarToken, soloDocente } = require("../Middleware/verificarToken");

router.get("/",       verificarToken, ctrl.getAlumnos);
router.get("/:id",    verificarToken, ctrl.getAlumno);
router.post("/",      verificarToken, soloDocente, ctrl.crearAlumno);
router.put("/:id",    verificarToken, soloDocente, ctrl.actualizarAlumno);
router.delete("/:id", verificarToken, soloDocente, ctrl.eliminarAlumno);

module.exports = router;