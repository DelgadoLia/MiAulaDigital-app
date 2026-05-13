const modelo = require('../Modelo/mensajeModelo');

const obtenerMensajes = async (req, res) => {

  try {

    const alumnoId = req.params.id;

    const mensajes =
      await modelo.obtenerMensajes(alumnoId);

    res.json(mensajes);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error:'Error obteniendo mensajes'
    });
  }
};

const enviarMensaje = async (req, res) => {

  try {

    const {
      remitenteId,
      receptorId,
      contenido
    } = req.body;

    await modelo.enviarMensaje(
      remitenteId,
      receptorId,
      contenido
    );

    res.json({
      ok:true
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error:'Error enviando mensaje'
    });
  }
};

module.exports = {
  obtenerMensajes,
  enviarMensaje
};