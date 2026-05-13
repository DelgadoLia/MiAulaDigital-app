const modelo = require('../Modelo/aseoModelo');

async function getAseo(req, res) {

  try {

    const datos =
      await modelo.obtenerAseo();

    res.json(datos);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      mensaje:'Error'
    });
  }
}

async function saveAseo(req, res) {

  try {

    await modelo.guardarAseo(req.body);

    res.json({
      mensaje:'Guardado'
    });

  } catch (err) {

    res.status(500).json({
      mensaje:'Error'
    });
  }
}

module.exports = {
  getAseo,
  saveAseo
};