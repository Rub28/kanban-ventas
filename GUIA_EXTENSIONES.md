# 📚 Guía de Extensiones y Mejoras

Este documento explica cómo agregar nuevas características al proyecto.

## 1️⃣ Agregar Nuevo Usuario

### En la BD directamente:
```sql
INSERT INTO `usuarios` 
(`nombre`, `email`, `rol`, `estado`) 
VALUES
('Tu Nombre', 'tu@email.com', 'Operador', 1);
```

### Cambiar contraseña (cuando se implemente autenticación):
```sql
UPDATE `usuarios` 
SET `password` = SHA2('nueva_contraseña', 256) 
WHERE `email` = 'tu@email.com';
```

## 2️⃣ Personalizar Colores del Tablero

En `public/css/styles.css`, modifica las variables CSS:

```css
:root {
  --primary-color: #2ecc71;        /* Verde */
  --secondary-color: #3498db;      /* Azul */
  --danger-color: #e74c3c;         /* Rojo */
  --warning-color: #f39c12;        /* Naranja */
  --dark-color: #2c3e50;           /* Oscuro */
  --light-color: #ecf0f1;          /* Claro */
}
```

## 3️⃣ Cambiar Nombres de Fases

### En el archivo HTML (`views/index.html`):
Busca y reemplaza el nombre de fase:

```html
<!-- ANTES -->
<h2>Recepción</h2>

<!-- DESPUÉS -->
<h2>Nueva Fase</h2>
```

### En la BD:
```sql
ALTER TABLE `chat_solicitud` 
MODIFY `estado` enum('Nueva Fase 1', 'Nueva Fase 2', ...);
```

## 4️⃣ Agregar Nueva Columna al Tablero

### 1. Agregar a la BD:
```sql
-- Modificar tabla de solicitudes
ALTER TABLE `chat_solicitud` 
MODIFY `estado` enum(
  'Recepción', 
  'Orden', 
  'En empaquetado', 
  'Lista para Entrega', 
  'En ruta',
  'Revisión Final',  -- ← NUEVA FASE
  'Entregado'
) DEFAULT 'Recepción';
```

### 2. Agregar HTML (en `views/index.html`):
```html
<!-- ANTES DEL CIERRE DE .kanban-board -->
<div class="kanban-column" data-status="Revisión Final">
  <div class="column-header custom-color">
    <div class="column-title">
      <i class="fas fa-clipboard-check"></i>
      <h2>Revisión Final</h2>
    </div>
    <span class="column-count" id="count-revision-final">0</span>
  </div>
  <div class="cards-container" id="column-revision-final">
    <!-- Las tarjetas se cargarán aquí -->
  </div>
</div>
```

### 3. Agregar CSS (en `public/css/styles.css`):
```css
.column-header.custom-color {
  background: linear-gradient(135deg, #34495e, #2c3e50);
  border-bottom-color: #1a252f;
}
```

## 5️⃣ Agregar Sistema de Notificaciones en Tiempo Real

Instala Socket.IO:
```bash
npm install socket.io
```

Crea archivo `config/socket.js`:
```javascript
const socketIO = require('socket.io');

module.exports = (server) => {
  const io = socketIO(server, {
    cors: { origin: "*" }
  });

  io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    socket.on('solicitud_movida', (data) => {
      io.emit('actualizar_tablero', data);
    });
  });

  return io;
};
```

## 6️⃣ Agregar Filtro por Usuario Asignado

En `views/index.html` agrega:
```html
<div class="filter-group">
  <label for="filterUser">Usuario:</label>
  <select id="filterUser" onchange="filtrarPorUsuario()">
    <option value="">Todos</option>
    <option value="María Operador">María Operador</option>
    <option value="Carlos Operador">Carlos Operador</option>
  </select>
</div>
```

En `public/js/kanban.js` agrega:
```javascript
function filtrarPorUsuario() {
  const usuario = document.getElementById('filterUser').value;
  const cards = document.querySelectorAll('.kanban-card');
  
  cards.forEach(card => {
    if (!usuario) {
      card.style.display = 'block';
    } else {
      // Lógica de filtrado
      card.style.display = 'block';
    }
  });
}
```

## 7️⃣ Exportar Reportes a PDF

Instala librería:
```bash
npm install html2pdf
```

En `public/js/kanban.js`:
```javascript
function exportarPDF() {
  const elemento = document.querySelector('.kanban-board');
  const opt = {
    margin: 10,
    filename: 'tablero-kanban.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
  };
  html2pdf().set(opt).from(elemento).save();
}
```

## 8️⃣ Agregar Búsqueda en Tiempo Real

En `views/index.html`:
```html
<div class="filter-group">
  <input type="text" id="searchBox" placeholder="Buscar..." onkeyup="buscarTarjeta()">
</div>
```

En `public/js/kanban.js`:
```javascript
function buscarTarjeta() {
  const search = document.getElementById('searchBox').value.toLowerCase();
  const cards = document.querySelectorAll('.kanban-card');
  
  cards.forEach(card => {
    const nombre = card.querySelector('.card-name').textContent.toLowerCase();
    const mensaje = card.querySelector('.card-message').textContent.toLowerCase();
    
    if (nombre.includes(search) || mensaje.includes(search)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}
```

## 9️⃣ Implementar Autenticación

### 1. Instalar dependencias:
```bash
npm install bcryptjs jsonwebtoken express-session
```

### 2. Crear ruta de login (`routes/auth.js`):
```javascript
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const connection = await pool.getConnection();
    
    const [users] = await connection.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );
    connection.release();
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## 🔟 Agregar Caché con Redis

```bash
npm install redis
```

En `config/cache.js`:
```javascript
const redis = require('redis');
const client = redis.createClient();

module.exports = {
  get: async (key) => {
    return await client.get(key);
  },
  set: async (key, value, ttl = 3600) => {
    await client.setEx(key, ttl, JSON.stringify(value));
  }
};
```

## 🎨 Cambiar Tema Completo

Crea un nuevo archivo de estilos `public/css/theme-dark.css`:

```css
:root {
  --primary-color: #00d4ff;
  --dark-color: #0a0e27;
  --light-color: #1a1f3a;
  /* ... más colores ... */
}
```

Luego cámbialo en `views/index.html`:
```html
<!-- De esto -->
<link rel="stylesheet" href="/css/styles.css">

<!-- A esto -->
<link rel="stylesheet" href="/css/theme-dark.css">
```

---

## 💡 Tips de Desarrollo

1. **Usar DevTools** - Presiona F12 en el navegador para ver la consola
2. **Logs en servidor** - Revisa la terminal donde corre Node.js
3. **Actualizar después de cambios** - Si cambias CSS, recarga la página (Ctrl+F5)
4. **Probar en móvil** - Usa Chrome DevTools para emular dispositivos
5. **Hacer backup de BD** - Antes de cambios importantes: `mysqldump -u root -p whatsapp_dashboard > backup.sql`

---

Espero que esta guía te ayude a extender el proyecto. ¡Diviértete desarrollando! 🚀
