const pool = require("../DB/conexion");

async function obtenerAseo() {

  const [rows] = await pool.query(`
    SELECT * FROM aseo
    ORDER BY id ASC
  `);

  return rows;
}

async function guardarAseo(data) {

  await pool.query(`
    DELETE FROM aseo
  `);

  for (const item of data) {

    await pool.query(`
      INSERT INTO aseo
      (
        dia,
        actividad,
        alumno,
        numero
      )

      VALUES (?, ?, ?, ?)
    `, [
      item.dia,
      item.actividad,
      item.alumno,
      item.numero
    ]);

  }

}

module.exports = {
  obtenerAseo,
  guardarAseo
};