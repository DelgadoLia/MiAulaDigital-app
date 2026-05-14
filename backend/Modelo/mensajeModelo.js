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

const obtenerConversaciones = async () => {
  const [rows] = await db.query(`
    SELECT 
      u.id AS usuarioId,
      u.nombreCompleto AS nombre,
      a.nombre AS alumnoNombre,
      COUNT(CASE WHEN m.leido = 0 AND m.receptorId = 1 THEN 1 END) AS noLeidos,
      MAX(m.fecha) AS ultimaFecha,
      (SELECT contenido FROM mensajes 
       WHERE remitenteId = u.id OR receptorId = u.id
       ORDER BY fecha DESC LIMIT 1) AS ultimoMensaje
    FROM usuarios u
    JOIN alumnos a ON a.tutorId = u.id
    INNER JOIN mensajes m ON m.remitenteId = u.id OR m.receptorId = u.id
    WHERE u.rol = 'padre'
    GROUP BY u.id, u.nombreCompleto, a.nombre
    ORDER BY ultimaFecha DESC
  `);
  return rows;
};

module.exports = { obtenerMensajes, enviarMensaje, obtenerConversaciones };