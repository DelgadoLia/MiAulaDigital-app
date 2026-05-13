const db = require('../DB/conexion');

const obtenerMensajes = async (alumnoId) => {

  const [rows] = await db.query(`

    SELECT *
    FROM mensajes

    WHERE
      remitenteId = ?
      OR receptorId = ?

    ORDER BY fecha ASC

  `, [alumnoId, alumnoId]);

  return rows;
};

const enviarMensaje = async (
  remitenteId,
  receptorId,
  contenido
) => {

  const [result] = await db.query(`

    INSERT INTO mensajes
    (
      remitenteId,
      receptorId,
      contenido,
      leido
    )

    VALUES (?, ?, ?, 0)

  `, [
    remitenteId,
    receptorId,
    contenido
  ]);

  return result;
};

module.exports = {
  obtenerMensajes,
  enviarMensaje
};