const pool = require("../DB/conexion");

async function crearUsuario(nombreCompleto, nombreUsuario, contrasena, rol, correo) {
  const sql = `INSERT INTO usuarios (nombreCompleto, nombreUsuario, contrasena, rol, correo)
               VALUES (?, ?, ?, ?, ?)`;
  const [result] = await pool.query(sql, [nombreCompleto, nombreUsuario, contrasena, rol, correo]);
  return result.insertId;
}

async function getUsuarioPorNombre(nombreUsuario) {
  const [rows] = await pool.query(
    "SELECT * FROM usuarios WHERE nombreUsuario = ?", [nombreUsuario]
  );
  return rows[0];
}

// Para login de padres: busca por nombre del alumno + fecha nacimiento
async function getUsuarioPorAlumno(nombre, fechaNac) {
  const sql = `
    SELECT u.*, a.id AS alumnoId, a.nombre AS alumnoNombre
    FROM usuarios u
    JOIN alumnos a ON a.tutorId = u.id
    WHERE a.nombre = ? AND a.fechaNac = ? AND u.rol = 'padre'
  `;
  const [rows] = await pool.query(sql, [nombre, fechaNac]);
  return rows[0];
}

async function aumentarIntentoFallido(id) {
  await pool.query(
    "UPDATE usuarios SET intentosFallidos = intentosFallidos + 1 WHERE id = ?", [id]
  );
}

async function bloquearCuenta(id) {
  await pool.query(
    "UPDATE usuarios SET bloqueadoHasta = DATE_ADD(NOW(), INTERVAL 5 MINUTE) WHERE id = ?", [id]
  );
}

async function reiniciarIntentos(id) {
  await pool.query(
    "UPDATE usuarios SET intentosFallidos = 0, bloqueadoHasta = NULL WHERE id = ?", [id]
  );
}

async function updateContrasena(id, nuevaContrasena) {
  const [result] = await pool.query(
    "UPDATE usuarios SET contrasena = ? WHERE id = ?", [nuevaContrasena, id]
  );
  return result.affectedRows;
}

module.exports = {
  crearUsuario,
  getUsuarioPorNombre,
  getUsuarioPorAlumno,
  aumentarIntentoFallido,
  bloquearCuenta,
  reiniciarIntentos,
  updateContrasena,
};