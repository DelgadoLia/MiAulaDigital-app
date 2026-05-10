const db = require('../DB/conexion');

// Obtener todas las citas
async function getCitas() {
  const [rows] = await db.query(`
    SELECT 
      c.*,
      a.nombre AS alumnoNombre
    FROM citas c
    INNER JOIN alumnos a ON c.alumnoId = a.id
    ORDER BY c.fecha ASC, c.hora ASC
  `);

  return rows;
}

async function getCitasPorPadre(padreId) {

  const [rows] = await db.query(`
    SELECT 
      c.*,
      a.nombre AS alumnoNombre
    FROM citas c
    INNER JOIN alumnos a ON c.alumnoId = a.id
    WHERE c.padreId = ?
    ORDER BY c.fecha ASC, c.hora ASC
  `, [padreId]);

  return rows;
}

// Crear cita
async function crearCita(alumnoId, padreId, fecha, hora, motivo) {

  const [result] = await db.query(`
    INSERT INTO citas
    (alumnoId, padreId, fecha, hora, motivo, estado)
    VALUES (?, ?, ?, ?, ?, 'pendiente')
  `, [alumnoId, padreId, fecha, hora, motivo]);

  return result.insertId;
}

// Confirmar cita
async function confirmarCita(id) {
  await db.query(`
    UPDATE citas
    SET estado = 'confirmada'
    WHERE id = ?
  `, [id]);
}

// Eliminar cita
async function eliminarCita(id) {
  await db.query(`
    DELETE FROM citas
    WHERE id = ?
  `, [id]);
}

module.exports = {
  getCitas,
  getCitasPorPadre,
  crearCita,
  confirmarCita,
  eliminarCita
};