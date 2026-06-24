const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Vistas
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.engine('html', (path, options, callback) => {
  const fs = require('fs');
  fs.readFile(path, 'utf8', callback);
});

// Rutas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/campanas.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'campanas.html'));
});

app.get('/reportes.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'reportes.html'));
});

// API Routes
app.use('/api/mensajes', require('./routes/mensajes'));
app.use('/api/solicitudes', require('./routes/solicitudes'));
app.use('/api/eventos', require('./routes/eventos'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/campanas', require('./routes/campanas'));
app.use('/api/evento-campana', require('./routes/evento-campana'));
app.use('/api/reportes', require('./routes/reportes'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`Abre http://localhost:${PORT} en tu navegador`);
});
