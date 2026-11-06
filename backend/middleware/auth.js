const jwt = require('jsonwebtoken');

// Úsalo en las rutas que requieren sesión: router.get('/mios', verificarToken, ...)
module.exports = function verificarToken(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ mensaje: 'Debes iniciar sesión.' });
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ mensaje: 'Tu sesión expiró. Inicia sesión de nuevo.' });
  }
};
