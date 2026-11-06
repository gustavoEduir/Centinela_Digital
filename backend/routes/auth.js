const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { registro, login } = require('../controllers/authController');

// Máximo 10 intentos cada 15 minutos por IP, para frenar adivinación de contraseñas
const limitador = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { mensaje: 'Demasiados intentos. Espera unos minutos.' },
});

router.post('/registro', limitador, registro);
router.post('/login', limitador, login);

module.exports = router;
