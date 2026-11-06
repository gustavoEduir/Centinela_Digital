const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const reCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const reTelefono = /^\d{8,15}$/;

exports.registro = async (req, res) => {
  try {
    const { correo, password, telefono, nombres, apellidos } = req.body;

    if (![correo, password, telefono, nombres, apellidos].every((v) => typeof v === 'string' && v.trim()))
      return res.status(400).json({ mensaje: 'Completa todos los campos.' });
    if (!reCorreo.test(correo.trim()))
      return res.status(400).json({ mensaje: 'El correo no es válido.' });
    if (password.length < 8)
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres.' });
    if (!reTelefono.test(telefono.replace(/[\s-]/g, '')))
      return res.status(400).json({ mensaje: 'El teléfono debe tener solo números (8 a 15 dígitos).' });

    const hash = await bcrypt.hash(password, 12);
    await Usuario.create({
      correo, password: hash, telefono: telefono.replace(/[\s-]/g, ''), nombres, apellidos,
    });
    res.status(201).json({ mensaje: 'Cuenta creada.' });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ mensaje: 'Ya existe una cuenta con ese correo.' });
    console.error(err);
    res.status(500).json({ mensaje: 'No pudimos crear la cuenta. Inténtalo más tarde.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    if (typeof correo !== 'string' || typeof password !== 'string')
      return res.status(400).json({ mensaje: 'Escribe tu correo y tu contraseña.' });

    const usuario = await Usuario.findOne({ correo: correo.trim().toLowerCase() });
    const valido = usuario && (await bcrypt.compare(password, usuario.password));
    // Mismo mensaje para correo inexistente y contraseña incorrecta
    if (!valido) return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos.' });

    const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, usuario: { nombres: usuario.nombres } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'No pudimos iniciar sesión. Inténtalo más tarde.' });
  }
};
