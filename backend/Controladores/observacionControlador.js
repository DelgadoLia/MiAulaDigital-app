const observacionModelo = require("../Modelo/observacionModelo");

async function getAll(req, res) {
  try {
    const observaciones = await observacionModelo.getObservaciones();
    res.json(observaciones);
  } catch (error) {
    console.error("Error al obtener observaciones:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function crear(req, res) {
  try {
    const { alumnoId, fecha, descripcion, tipo, etiquetas } = req.body;
    if (!alumnoId || !fecha || !descripcion)
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    const id = await observacionModelo.crearObservacion(alumnoId, fecha, descripcion, tipo, etiquetas);
    res.status(201).json({ mensaje: "Observación guardada", id });
  } catch (error) {
    console.error("Error al crear observación:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function eliminar(req, res) {
  try {
    const { id } = req.params;
    const filas = await observacionModelo.eliminarObservacion(id);
    if (!filas) return res.status(404).json({ mensaje: "Observación no encontrada" });
    res.json({ mensaje: "Observación eliminada" });
  } catch (error) {
    console.error("Error al eliminar observación:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

module.exports = { getAll, crear, eliminar };