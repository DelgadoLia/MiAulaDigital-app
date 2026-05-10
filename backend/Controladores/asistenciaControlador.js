const asistModelo = require("../Modelo/asistenciaModelo");

async function getAsistenciaPorFecha(req, res) {
  try {
    const fecha = req.query.fecha || new Date().toISOString().split("T")[0];
    const datos = await asistModelo.getAsistenciaPorFecha(fecha);
    res.json(datos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function getAsistenciaAlumno(req, res) {
  try {
    const datos = await asistModelo.getAsistenciaPorAlumno(req.params.alumnoId);
    res.json(datos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function registrarMasiva(req, res) {
  try {
    const { fecha, registros } = req.body;
    // registros = [{ alumnoId: 1, estado: 'P' }, ...]
    if (!fecha || !registros?.length)
      return res.status(400).json({ mensaje: "Faltan datos" });

    await asistModelo.registrarAsistenciaMasiva(registros, fecha);
    res.json({ mensaje: "Asistencia registrada correctamente" });
  } catch (error) {
    console.error("Error al registrar asistencia:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

module.exports = { getAsistenciaPorFecha, getAsistenciaAlumno, registrarMasiva };