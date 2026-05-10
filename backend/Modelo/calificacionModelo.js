const pool = require("../DB/conexion");

async function getCalificacionesPorAlumno(alumnoId, bimestre = null) {
  let sql = "SELECT * FROM calificaciones WHERE alumnoId = ?";
  const params = [alumnoId];
  if (bimestre) { sql += " AND bimestre = ?"; params.push(bimestre); }
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function getCalificacionesTodos(bimestre = 1) {
  const sql = `
    SELECT a.nombre AS alumno, c.materia, c.calificacion, c.bimestre, c.fecha
    FROM calificaciones c
    JOIN alumnos a ON a.id = c.alumnoId
    WHERE c.bimestre = ?
    ORDER BY a.nombre
  `;
  const [rows] = await pool.query(sql, [bimestre]);
  return rows;
}

async function upsertCalificacion(alumnoId, materia, calificacion, bimestre, fecha) {
  const sql = `
    INSERT INTO calificaciones (alumnoId, materia, calificacion, bimestre, fecha)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE calificacion = VALUES(calificacion), fecha = VALUES(fecha)
  `;
  const [result] = await pool.query(sql, [alumnoId, materia, calificacion, bimestre, fecha]);
  return result;
}

module.exports = {
  getCalificacionesPorAlumno,
  getCalificacionesTodos,
  upsertCalificacion,
};