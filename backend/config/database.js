const mongoose = require('mongoose');

async function conectarDB() {
  if (!process.env.MONGO_URI) throw new Error('Falta MONGO_URI en el archivo .env');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB conectado');
}

module.exports = conectarDB;
