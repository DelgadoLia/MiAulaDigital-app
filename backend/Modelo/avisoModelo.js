const db = require('../DB/conexion');

const obtenerAvisos = async () => {

  const [rows] = await db.query(`
    SELECT *
    FROM avisos
    ORDER BY fecha DESC
  `);

  return rows;
};

const crearAviso = async (
  titulo,
  contenido,
  categoria
) => {

  const sql = `
    INSERT INTO avisos
    (titulo,contenido,categoria)
    VALUES (?,?,?)
  `;

  await db.query(sql,[
    titulo,
    contenido,
    categoria
  ]);
};

const eliminarAviso = async (id) => {

  await db.query(
    'DELETE FROM avisos WHERE id=?',
    [id]
  );

};

module.exports = {
  obtenerAvisos,
  crearAviso,
  eliminarAviso
};