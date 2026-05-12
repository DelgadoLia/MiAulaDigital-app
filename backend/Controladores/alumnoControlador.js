const alumnoModelo = require("../Modelo/alumnoModelo");

async function getAlumnos(req, res) {
  try {
    const alumnos = await alumnoModelo.getAlumnos();
    res.json(alumnos);
  } catch (error) {
    console.error("Error al obtener alumnos:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function getAlumno(req, res) {
  try {
    const alumno = await alumnoModelo.getAlumnoPorId(req.params.id);
    if (!alumno) return res.status(404).json({ mensaje: "Alumno no encontrado" });
    res.json(alumno);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function crearAlumno(req, res) {
  try {
    const { nombre, fechaNac, curp, tutorId } = req.body;
    if (!nombre || !fechaNac)
      return res.status(400).json({ mensaje: "Nombre y fecha de nacimiento son obligatorios" });

    const id = await alumnoModelo.crearAlumno(nombre, fechaNac, curp, tutorId);
    res.status(201).json({ mensaje: "Alumno registrado", id });
  } catch (error) {
    console.error("Error al crear alumno:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function actualizarAlumno(req, res) {
  try {
    const filas = await alumnoModelo.actualizarAlumno(req.params.id, req.body);
    if (filas === 0) return res.status(404).json({ mensaje: "Alumno no encontrado" });
    res.json({ mensaje: "Alumno actualizado" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function eliminarAlumno(req, res) {
  try {
    const filas = await alumnoModelo.eliminarAlumno(req.params.id);
    if (filas === 0) return res.status(404).json({ mensaje: "Alumno no encontrado" });
    res.json({ mensaje: "Alumno eliminado" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
}

async function obtenerPerfilAlumno(req, res) {
  try {
    const alumnoId = req.usuario.alumnoId;

    const alumno = await modelo.obtenerAlumnoPorId(alumnoId);

    if (!alumno) {
      return res.status(404).json({
        mensaje: "Alumno no encontrado"
      });
    }

    res.json(alumno);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener alumno"
    });
  }
}

module.exports = { getAlumnos, getAlumno, crearAlumno, actualizarAlumno, eliminarAlumno, obtenerPerfilAlumno };