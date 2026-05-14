const pool = require("../DB/conexion");

async function getObservaciones() {
  const [rows] = await pool.query(`
    SELECT o.*, a.nombre AS alumnoNombre
    FROM observaciones o
    JOIN alumnos a ON a.id = o.alumnoId
    ORDER BY o.fecha DESC
  `);
  return rows;
}

async function crearObservacion(alumnoId, fecha, descripcion, tipo, etiquetas) {
  const [result] = await pool.query(`
    INSERT INTO observaciones (alumnoId, fecha, descripcion, tipo, etiquetas)
    VALUES (?, ?, ?, ?, ?)
  `, [alumnoId, fecha, descripcion, tipo, etiquetas]);
  return result.insertId;
}

async function eliminarObservacion(id) {
  const [result] = await pool.query(
    "DELETE FROM observaciones WHERE id = ?", [id]
  );
  return result.affectedRows;
}

module.exports = { getObservaciones, crearObservacion, eliminarObservacion };