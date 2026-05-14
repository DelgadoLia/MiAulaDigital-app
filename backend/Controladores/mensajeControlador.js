const modelo = require('../Modelo/mensajeModelo');

const obtenerMensajes = async (req, res) => {
  try {
    const id = req.params.id;
    const mensajes = await modelo.obtenerMensajes(id);
    res.json(mensajes);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error obteniendo mensajes' });
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

const obtenerConversaciones = async (req, res) => {
  try {
    const conversaciones = await modelo.obtenerConversaciones();
    res.json(conversaciones);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error obteniendo conversaciones' });
  }
};

module.exports = { obtenerMensajes, enviarMensaje, obtenerConversaciones };