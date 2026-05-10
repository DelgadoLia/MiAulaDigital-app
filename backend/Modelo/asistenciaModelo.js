const pool = require("../DB/conexion");

async function getAsistenciaPorFecha(fecha) {
  const sql = `
    SELECT a.id AS alumnoId, a.nombre, COALESCE(as2.estado,'P') AS estado
    FROM alumnos a
    LEFT JOIN asistencia as2 ON as2.alumnoId = a.id AND as2.fecha = ?
    ORDER BY a.nombre
  `;
  const [rows] = await pool.query(sql, [fecha]);
  return rows;
}

async function getAsistenciaPorAlumno(alumnoId) {
  const [rows] = await pool.query(
    "SELECT * FROM asistencia WHERE alumnoId = ? ORDER BY fecha DESC", [alumnoId]
  );
  return rows;
}

async function registrarAsistencia(alumnoId, fecha, estado) {
  const sql = `
    INSERT INTO asistencia (alumnoId, fecha, estado)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE estado = VALUES(estado)
  `;
  const [result] = await pool.query(sql, [alumnoId, fecha, estado]);
  return result;
}

async function registrarAsistenciaMasiva(registros, fecha) {
  // registros = [{ alumnoId, estado }, ...]
  const valores = registros.map(r => [r.alumnoId, fecha, r.estado]);
  const sql = `
    INSERT INTO asistencia (alumnoId, fecha, estado)
    VALUES ?
    ON DUPLICATE KEY UPDATE estado = VALUES(estado)
  `;
  const [result] = await pool.query(sql, [valores]);
  return result;
}

module.exports = {
  getAsistenciaPorFecha,
  getAsistenciaPorAlumno,
  registrarAsistencia,
  registrarAsistenciaMasiva,
};