const califModelo = require("../Modelo/calificacionModelo");

async function getCalificacionesAlumno(req, res) {
  try {
    const { bimestre } = req.query;
    const datos = await califModelo.getCalificacionesPorAlumno(req.params.alumnoId, bimestre);
    res.json(datos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function getCalificacionesTodos(req, res) {
  try {
    const { bimestre = 1 } = req.query;
    const datos = await califModelo.getCalificacionesTodos(bimestre);
    res.json(datos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function guardarCalificacion(req, res) {
  try {
    const { alumnoId, materia, calificacion, bimestre, fecha } = req.body;
    if (!alumnoId || !materia || calificacion === undefined)
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });

    await califModelo.upsertCalificacion(alumnoId, materia, calificacion, bimestre || 1, fecha || new Date());
    res.json({ mensaje: "Calificación guardada" });
  } catch (error) {
    console.error("Error al guardar calificación:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

module.exports = { getCalificacionesAlumno, getCalificacionesTodos, guardarCalificacion };