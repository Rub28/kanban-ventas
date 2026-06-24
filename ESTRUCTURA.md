# 📋 Estructura Completa del Proyecto

```
DashBoard-Whatsapp/
│
├── 📁 public/                    # Archivos estáticos del cliente
│   ├── 📁 css/
│   │   └── styles.css           # 📊 Estilos principales (colores, layout, responsivo)
│   ├── 📁 js/
│   │   └── kanban.js            # 🎮 Lógica del cliente (drag&drop, filtros)
│   └── 📁 img/                  # Lugar para logos y imágenes
│
├── 📁 views/
│   └── index.html               # 🎨 HTML principal del tablero
│
├── 📁 routes/                   # 🛣️ Rutas API
│   ├── mensajes.js              # GET mensajes de WhatsApp
│   ├── solicitudes.js           # CRUD de solicitudes/tarjetas
│   ├── eventos.js               # GET/POST eventos (historial)
│   └── usuarios.js              # GET usuarios del sistema
│
├── 📁 config/
│   ├── database.js              # 🗄️ Conexión a MySQL
│   └── constantes.js            # 📌 Configuración (roles, estados, permisos)
│
├── 📁 controllers/              # 🎛️ Lógica de negocio (para futuro)
│
├── 📁 models/                   # 📦 Modelos de datos (para futuro)
│
├── 📁 database/
│   └── schema.sql               # 📊 Script SQL para crear tablas
│
├── 📄 app.js                    # 🚀 Servidor principal Express
├── 📄 package.json              # 📝 Dependencias del proyecto
├── 📄 .env.example              # 🔐 Plantilla de variables de entorno
├── 📄 .gitignore                # 🚫 Archivos a ignorar en git
├── 📄 README.md                 # 📖 Documentación completa
├── 📄 INSTALACION_RAPIDA.md     # ⚡ Setup rápido
├── 📄 GUIA_EXTENSIONES.md       # 🔧 Cómo extender el proyecto
├── 📄 EJEMPLOS_USO.md           # 💡 Ejemplos prácticos
└── 📄 ESTRUCTURA.md             # 📋 Este archivo

```

## 🔍 Descripción de Archivos Clave

### Backend (Node.js + Express)

| Archivo | Función | Importante |
|---------|---------|-----------|
| `app.js` | Inicia servidor, configura rutas | El corazón de la app |
| `config/database.js` | Pool de conexiones MySQL | Conecta con BD |
| `config/constantes.js` | Configuración global | Estados, roles, permisos |
| `routes/*.js` | Endpoints REST API | Comunica con BD |

### Frontend (HTML + CSS + JS)

| Archivo | Función | Importante |
|---------|---------|-----------|
| `views/index.html` | Estructura del tablero | El HTML que ves |
| `public/css/styles.css` | Estilos y diseño | Bonito y responsivo |
| `public/js/kanban.js` | Interactividad | Drag&drop, filtros |

### Base de Datos

| Tabla | Contiene | Relaciones |
|-------|----------|-----------|
| `chat_mensajes` | Mensajes de WhatsApp | ← origen de datos |
| `chat_solicitud` | Tarjetas del Kanban | → una por mensaje |
| `chat_evento` | Historial de cambios | → eventos de solicitud |
| `usuarios` | Usuarios del sistema | → quien realiza acciones |
| `permisos_rol` | Permisos por rol | → referencia de permisos |

## 🔄 Flujo de Datos

```
WhatsApp
   ↓
chat_mensajes (nuevo mensaje)
   ↓
Frontend detecta cambio
   ↓
Tablero actualiza
   ↓
Usuario mueve tarjeta
   ↓
POST a /api/solicitudes/:id
   ↓
Backend actualiza chat_solicitud
   ↓
Backend crea evento en chat_evento
   ↓
Frontend actualiza interfaz
```

## 🎨 Componentes Visuales

### HTML Estructura Principal
```html
<body>
  <div class="app-container">
    <header>...</header>           <!-- Logo y usuario -->
    <div class="toolbar">...</div> <!-- Filtros y botones -->
    <main>
      <div class="kanban-board">
        <div class="kanban-column">
          <div class="column-header">...</div>
          <div class="cards-container">
            <div class="kanban-card">...</div>
          </div>
        </div>
        <!-- 6 columnas -->
      </div>
    </main>
  </div>
  <div class="modal">...</div>   <!-- Detalles -->
</body>
```

### CSS Variables Principales
```css
:root {
  --primary-color: #2ecc71;      /* Verde - Entregado */
  --secondary-color: #3498db;    /* Azul - Acciones */
  --danger-color: #e74c3c;       /* Rojo - Recepción */
  --warning-color: #f39c12;      /* Naranja - Orden */
  --dark-color: #2c3e50;         /* Texto oscuro */
  --light-color: #ecf0f1;        /* Fondo claro */
}
```

## 🔌 Endpoints API

### GET
```
GET /api/mensajes              → Obtener todos los mensajes
GET /api/solicitudes          → Obtener solicitudes
GET /api/eventos?solicitud_id → Historial de una solicitud
GET /api/usuarios             → Listar usuarios
```

### POST
```
POST /api/solicitudes         → Crear solicitud
POST /api/eventos             → Registrar evento
```

### PUT
```
PUT /api/solicitudes/:id      → Actualizar solicitud (mover fase)
```

## 🗄️ Tablas de Base de Datos

### chat_mensajes (Original)
```
id (PK) | pushName | phone_number | mensaje | fh_registro | date_time | remoteJid
```

### chat_solicitud (Kanban)
```
id | mensaje_id | estado | asignado_a | usuario_id_asignado | fh_creacion | fh_actualizacion
```

### chat_evento (Historial)
```
id | solicitud_id | estado_anterior | estado_nuevo | accion | comentario | usuario_id | usuario_nombre | rol | fh_evento
```

### usuarios (Control de Acceso)
```
id | nombre | email | password | rol | estado | fh_creacion | fh_actualizacion
```

### permisos_rol (Configuración)
```
id | rol | puede_crear | puede_editar | puede_eliminar | puede_ver_reportes | ...
```

## 🎯 Variables de Entorno (.env)

```bash
DB_HOST=localhost              # Servidor MySQL
DB_USER=root                   # Usuario MySQL
DB_PASSWORD=contraseña         # Contraseña MySQL
DB_NAME=whatsapp_dashboard     # Nombre de BD
DB_PORT=3306                   # Puerto MySQL
SERVER_PORT=3000               # Puerto Node.js
NODE_ENV=development           # Entorno (development/production)
```

## 📊 Estados del Kanban

```
1. Recepción         🔴 (Rojo)      - Nuevos mensajes sin procesar
2. Orden             🟠 (Naranja)   - Confirmado, requiere acción
3. En empaquetado    🔵 (Azul)      - Siendo preparado
4. Lista Entrega     🟣 (Púrpura)   - Listo para enviar
5. En ruta           🌊 (Turquesa)  - En camino
6. Entregado         🟢 (Verde)     - Completado
```

## 👥 Roles y Permisos

```
Administrador
├─ Ver todos
├─ Mover cualquier tarjeta
├─ Gestionar usuarios
└─ Ver reportes

Supervisor
├─ Ver equipo
├─ Mover tarjetas asignadas
├─ Asignar tareas
└─ Ver reportes

Operador
├─ Ver sus tareas
├─ Mover sus tarjetas
└─ Agregar comentarios
```

## 🚀 Pasos de Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Crear base de datos
mysql < database/schema.sql

# 3. Configurar .env
cp .env.example .env
# Editar .env con datos reales

# 4. Iniciar servidor
npm run dev        # Desarrollo (con nodemon)
npm start          # Producción

# 5. Abrir navegador
http://localhost:3000
```

## 🧪 Pruebas Manuales

1. ✅ Cargar página → Ver tablero con 5 mensajes
2. ✅ Hacer clic → Abrir modal con detalles
3. ✅ Arrastrar → Mover tarjeta a otra columna
4. ✅ Ver historial → Mostrar cambios anteriores
5. ✅ Filtrar → Reducir tarifas por fecha/estado
6. ✅ Actualizar → Cargar datos frescos de BD

## 📈 Escalabilidad Futura

Para crecer, considera:
- [ ] Redis para caché
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Autenticación JWT
- [ ] Microservicios
- [ ] Docker + Kubernetes
- [ ] CDN para archivos estáticos

---

**¡Proyecto completamente funcional! 🎉**

Ahora tienes un tablero Kanban profesional, amigable y listo para producción.
