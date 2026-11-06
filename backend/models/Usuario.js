const { Schema, model } = require('mongoose');

const usuarioSchema = new Schema(
  {
    correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // siempre guardada con hash, nunca en texto plano
    telefono: { type: String, required: true, trim: true },
    nombres: { type: String, required: true, trim: true },
    apellidos: { type: String, required: true, trim: true },
    rol: { type: String, enum: ['usuario', 'admin'], default: 'usuario' },
  },
  { timestamps: true }
);

module.exports = model('Usuario', usuarioSchema);
