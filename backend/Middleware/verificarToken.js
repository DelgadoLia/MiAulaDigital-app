const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ mensaje: "Token requerido" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ mensaje: "Token inválido o expirado" });
    req.usuario = decoded;
    next();
  });
}

function soloDocente(req, res, next) {
  if (req.usuario.rol !== "docente")
    return res.status(403).json({ mensaje: "Acceso solo para docentes" });
  next();
}

module.exports = { verificarToken, soloDocente };