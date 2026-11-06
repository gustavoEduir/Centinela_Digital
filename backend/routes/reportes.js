const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/auth');
const {
  crearReporte,
  obtenerMisReportes
} = require('../controllers/reporteController');

// Registrar un reporte
router.post('/', verificarToken, crearReporte);

// Consultar los reportes del usuario autenticado
router.get('/mios', verificarToken, obtenerMisReportes);

module.exports = router;