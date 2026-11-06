
const crypto = require('crypto');
const Reporte = require('../models/Reporte');

const TIPOS_VALIDOS = [
  'Familiar',
  'De género',
  'Bullying',
  'Física',
  'Otra'
];

// Crear un reporte
exports.crearReporte = async (req, res) => {
  try {
    const {
      nombre,
      correo,
      ubicacion,
      tipo,
      descripcion
    } = req.body;

    // Validar el usuario autenticado
    const usuarioId =
      req.usuario?.id ||
      req.usuario?._id;

    if (!usuarioId) {
      return res.status(401).json({
        mensaje: 'Debes iniciar sesión para enviar un reporte.'
      });
    }

    // Validar los campos obligatorios
    if (
      typeof nombre !== 'string' ||
      !nombre.trim() ||
      nombre.trim().length > 120
    ) {
      return res.status(400).json({
        mensaje: 'Escribe un nombre válido de máximo 120 caracteres.'
      });
    }

    if (
      typeof correo !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())
    ) {
      return res.status(400).json({
        mensaje: 'Escribe un correo electrónico válido.'
      });
    }

    if (
      typeof ubicacion !== 'string' ||
      !ubicacion.trim() ||
      ubicacion.trim().length > 300
    ) {
      return res.status(400).json({
        mensaje: 'La ubicación es obligatoria y debe tener máximo 300 caracteres.'
      });
    }

    if (!TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({
        mensaje: 'Selecciona un tipo de violencia válido.'
      });
    }

    if (
      typeof descripcion !== 'string' ||
      !descripcion.trim() ||
      descripcion.trim().length > 3000
    ) {
      return res.status(400).json({
        mensaje: 'La descripción es obligatoria y debe tener máximo 3000 caracteres.'
      });
    }

    // Generar folio y guardar en MongoDB
    const folio = `CD-${crypto.randomUUID()}`;

    const nuevoReporte = await Reporte.create({
      folio,
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      ubicacion: ubicacion.trim(),
      tipo,
      descripcion: descripcion.trim(),
      usuarioId
    });

    return res.status(201).json({
      mensaje: 'Reporte registrado correctamente.',
      reporte: {
        folio: nuevoReporte.folio,
        nombre: nuevoReporte.nombre,
        tipo: nuevoReporte.tipo,
        estado: nuevoReporte.estado,
        creadoEn: nuevoReporte.createdAt
      }
    });

  } catch (error) {
    console.error('Error al crear reporte:', error.message);

    return res.status(500).json({
      mensaje: 'No fue posible registrar el reporte.'
    });
  }
};

// Consultar los reportes del usuario autenticado
exports.obtenerMisReportes = async (req, res) => {
  try {
    const usuarioId =
      req.usuario?.id ||
      req.usuario?._id;

    if (!usuarioId) {
      return res.status(401).json({
        mensaje: 'Debes iniciar sesión para consultar tus reportes.'
      });
    }

    const reportes = await Reporte.find({ usuarioId })
      .select('folio nombre tipo estado createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ reportes });

  } catch (error) {
    console.error('Error al consultar reportes:', error.message);

    return res.status(500).json({
      mensaje: 'No fue posible consultar tus reportes.'
    });
  }
};
