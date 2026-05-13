const express = require("express");
const cors    = require("cors");
const path = require("path");
require("dotenv").config();
const citaRutas = require('./Rutas/citaRutas');
const alumnoRutas = require("./Rutas/alumnoRutas");
const avisoRuta = require('./Rutas/avisoRuta');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Rutas
app.use("/api/auth",          require("./Rutas/usuarioRutas"));
app.use("/api/alumnos",       require("./Rutas/alumnoRutas"));
app.use("/api/calificaciones",require("./Rutas/calificacionRutas"));
app.use("/api/asistencia",    require("./Rutas/asistenciaRutas"));
app.use('/api/citas', citaRutas);
app.use("/api/alumnos", alumnoRutas);
app.use('/api/avisos', avisoRuta);

app.get("/", (req, res) => {
  res.json({ mensaje: "Mi Aula Digital API funcionando" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});