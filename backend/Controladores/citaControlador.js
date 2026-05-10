const citaModelo = require('../Modelo/citaModelo');

// Obtener citas
async function obtenerCitas(req, res) {

  try {

    let citas;

    // SI ES PADRE solo sus citas
    if (req.usuario.rol === 'padre') {

      citas = await citaModelo.getCitasPorPadre(req.usuario.id);

    } else {

      // DOCENTE todas
      citas = await citaModelo.getCitas();

    }

    res.json(citas);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al obtener citas'
    });

  }
}

// Crear cita
async function crearCita(req, res) {
  try {
    const { alumnoId, fecha, hora, motivo } = req.body;

    const padreId = req.usuario.id;

    const id = await citaModelo.crearCita(
      alumnoId,
      padreId,
      fecha,
      hora,
      motivo
    );

    res.status(201).json({
      mensaje: 'Cita creada',
      id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear cita' });
  }
}

// Confirmar cita
async function confirmarCita(req, res) {
  try {
    await citaModelo.confirmarCita(req.params.id);

    res.json({
      mensaje: 'Cita confirmada'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al confirmar cita' });
  }
}

// Eliminar cita
async function eliminarCita(req, res) {
  try {
    await citaModelo.eliminarCita(req.params.id);

    res.json({
      mensaje: 'Cita eliminada'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar cita' });
  }
}

module.exports = {
  obtenerCitas,
  crearCita,
  confirmarCita,
  eliminarCita
};