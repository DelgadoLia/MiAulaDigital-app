const bcrypt        = require("bcryptjs");
const jwt           = require("jsonwebtoken");
const usuarioModelo = require("../Modelo/usuarioModelo");

// ── Registro (docente, solo setup inicial)
async function registrarUsuario(req, res) {
  try {
    const { nombreCompleto, nombreUsuario, contrasena, rol = "docente", correo } = req.body;
    if (!nombreCompleto || !nombreUsuario || !contrasena)
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });

    const existe = await usuarioModelo.getUsuarioPorNombre(nombreUsuario);
    if (existe)
      return res.status(409).json({ mensaje: "El nombre de usuario ya existe" });

    const hash = await bcrypt.hash(contrasena, 10);
    const id   = await usuarioModelo.crearUsuario(nombreCompleto, nombreUsuario, hash, rol, correo);
    res.status(201).json({ mensaje: "Usuario registrado correctamente", id });
  } catch (error) {
    console.error("Error al registrar:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

// ── Login Docente (usuario + contraseña)
async function loginDocente(req, res) {
  try {
    const { nombreUsuario, contrasena } = req.body;
    if (!nombreUsuario || !contrasena)
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });

    const usuario = await usuarioModelo.getUsuarioPorNombre(nombreUsuario);
    if (!usuario)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    if (usuario.bloqueadoHasta && new Date(usuario.bloqueadoHasta) > new Date())
      return res.status(403).json({ mensaje: "Cuenta bloqueada. Intenta más tarde." });

    const valida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!valida) {
      await usuarioModelo.aumentarIntentoFallido(usuario.id);
      if (usuario.intentosFallidos + 1 >= 3) {
        await usuarioModelo.bloquearCuenta(usuario.id);
        return res.status(403).json({ mensaje: "Cuenta bloqueada 5 minutos por intentos fallidos." });
      }
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    await usuarioModelo.reiniciarIntentos(usuario.id);

    const token = jwt.sign(
      { id: usuario.id, nombreCompleto: usuario.nombreCompleto, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    console.log(`[LOGIN-DOCENTE] ${usuario.nombreUsuario}`);
    res.json({ 
      mensaje: "Login correcto", 
      token, 
      rol: usuario.rol, 
      nombre: usuario.nombreCompleto,
      userId: usuario.id
    });

  } catch (error) {
    console.error("Error en loginDocente:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

// ── Login Padre (nombre alumno + fecha nacimiento)
async function loginPadre(req, res) {
  try {
    const { nombre, fechaNac } = req.body;
    if (!nombre || !fechaNac)
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });

    const resultado = await usuarioModelo.getUsuarioPorAlumno(nombre, fechaNac);
    if (!resultado)
      return res.status(404).json({ mensaje: "Alumno no encontrado" });

    const token = jwt.sign(
      { id: resultado.id, rol: "padre", alumnoId: resultado.alumnoId },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    console.log(`[LOGIN-PADRE] Tutor de ${resultado.alumnoNombre}`);
    res.json({
      mensaje: "Login correcto",
      token,
      rol:      "padre",
      alumno:   resultado.alumnoNombre,
      alumnoId: resultado.alumnoId,
      tutor:    resultado.nombreCompleto,
      usuarioId: resultado.id
    });

  } catch (error) {
    console.error("Error en loginPadre:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function logoutUsuario(req, res) {
  console.log(`[LOGOUT]`, req.usuario);
  res.json({ mensaje: "Logout exitoso" });
}

module.exports = { registrarUsuario, loginDocente, loginPadre, logoutUsuario };