
const mongoose = require('mongoose');

const reporteSchema = new mongoose.Schema(
  {
    folio: {
      type: String,
      required: true,
      unique: true
    },

    nombre: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },

    correo: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    ubicacion: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },

    tipo: {
      type: String,
      required: true,
      enum: [
        'Familiar',
        'De género',
        'Bullying',
        'Física',
        'Otra'
      ]
    },

    descripcion: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000
    },

    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    },

    estado: {
      type: String,
      enum: [
        'Recibido',
        'En revisión',
        'En atención',
        'Resuelto',
        'Concluido'
      ],
      default: 'Recibido'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Reporte', reporteSchema);
