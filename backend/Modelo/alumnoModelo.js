const pool = require("../DB/conexion");

async function getAlumnos() {
  const [rows] = await pool.query(
    "SELECT * FROM alumnos ORDER BY nombre ASC"
  );
  return rows;
}

async function getAlumnoPorId(id) {
  const [rows] = await pool.query(
    "SELECT * FROM alumnos WHERE id = ?", [id]
  );
  return rows[0];
}

async function crearAlumno(nombre, fechaNac, curp, tutorId) {
  const [result] = await pool.query(
    "INSERT INTO alumnos (nombre, fechaNac, curp, tutorId) VALUES (?, ?, ?, ?)",
    [nombre, fechaNac, curp, tutorId]
  );
  return result.insertId;
}

async function actualizarAlumno(id, datos) {
  const { nombre, fechaNac, curp } = datos;
  const [result] = await pool.query(
    "UPDATE alumnos SET nombre=?, fechaNac=?, curp=? WHERE id=?",
    [nombre, fechaNac, curp, id]
  );
  return result.affectedRows;
}

async function eliminarAlumno(id) {
  const [result] = await pool.query(
    "DELETE FROM alumnos WHERE id=?", [id]
  );
  return result.affectedRows;
}

async function obtenerAlumnoPorId(id) {

  const [rows] = await db.query(`
    SELECT
      a.id,
      a.nombre,
      a.grupo,
      a.fechaNacimiento,
      p.nombre AS tutor
    FROM alumnos a
    LEFT JOIN padres p
      ON a.tutorId = p.id
    WHERE a.id = ?
  `, [id]);

  return rows[0];
}

module.exports = {
  getAlumnos,
  getAlumnoPorId,
  crearAlumno,
  actualizarAlumno,
  eliminarAlumno,
  obtenerAlumnoPorId
};