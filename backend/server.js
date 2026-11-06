require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/database');

const app = express();

app.use(cors({ origin: (process.env.CORS_ORIGIN || '').split(',').map((o) => o.trim()) }));
app.use(express.json());

app.get('/api/salud', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reportes', require('./routes/reportes'));
// Siguientes: /api/reportes, /api/cuestionarios, /api/centros

app.use((req, res) => res.status(404).json({ mensaje: 'Holaaaaaaa' }));

const PORT = process.env.PORT || 3000;
conectarDB()
  .then(() => app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}`)))
  .catch((err) => { console.error('No se pudo iniciar:', err.message); process.exit(1); });
