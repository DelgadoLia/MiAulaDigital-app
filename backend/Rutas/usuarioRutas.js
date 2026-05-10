const express    = require("express");
const router     = express.Router();
const ctrl       = require("../Controladores/usuarioControlador");
const { verificarToken } = require("../Middleware/verificarToken");

router.post("/registro",      ctrl.registrarUsuario);   // POST /api/auth/registro
router.post("/login/docente", ctrl.loginDocente);        // POST /api/auth/login/docente
router.post("/login/padre",   ctrl.loginPadre);          // POST /api/auth/login/padre
router.post("/logout", verificarToken, ctrl.logoutUsuario);

module.exports = router;