const Aviso =
  require('../Modelo/avisoModelo');

const obtenerAvisos =
async (req,res)=>{

  try{

    const avisos =
      await Aviso.obtenerAvisos();

    res.json(avisos);

  }catch(err){

    console.log(err);

    res.status(500).json({
      error:'Error obteniendo avisos'
    });

  }

};

const crearAviso =
async (req,res)=>{

  try{

    const {
      titulo,
      contenido,
      categoria
    } = req.body;

    await Aviso.crearAviso(
      titulo,
      contenido,
      categoria
    );

    res.json({
      message:'Aviso creado'
    });

  }catch(err){

    console.log(err);

    res.status(500).json({
      error:'Error creando aviso'
    });

  }

};

const eliminarAviso =
async (req,res)=>{

  try{

    await Aviso.eliminarAviso(
      req.params.id
    );

    res.json({
      message:'Aviso eliminado'
    });

  }catch(err){

    console.log(err);

    res.status(500).json({
      error:'Error eliminando aviso'
    });

  }

};

module.exports = {
  obtenerAvisos,
  crearAviso,
  eliminarAviso
};