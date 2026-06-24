# 📊 Tablero Kanban - Dashboard WhatsApp

Un tablero interactivo de gestión de mensajes WhatsApp con funcionalidad Kanban para flujos de trabajo, optimizado para usuarios con poca experiencia en sistemas.

## 🎯 Características Principales

✅ **Tablero Kanban Intuitivo** - 6 fases de gestión: Recepción, Orden, En empaquetado, Lista para Entrega, En ruta, Entregado

✅ **Drag & Drop** - Mover solicitudes entre fases de forma sencilla

✅ **Gestión de Usuarios** - Roles diferenciados: Administrador, Supervisor, Operador

✅ **Historial de Cambios** - Registro completo de acciones y comentarios

✅ **Filtrado de Datos** - Por fecha y estado

✅ **Interfaz Amigable** - Diseño moderno y responsivo para todos los dispositivos

✅ **Base de Datos MySQL** - Persistencia de datos segura

## 📋 Requisitos Previos

- Node.js 14.0.0 o superior
- MySQL 5.7 o superior
- npm o yarn

## 🚀 Instalación

### 1. Clonar o descargar el proyecto
```bash
cd DashBoard-Whatsapp
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar la base de datos

#### Paso 1: Crear la base de datos
```sql
CREATE DATABASE whatsapp_dashboard;
USE whatsapp_dashboard;
```

#### Paso 2: Ejecutar el script SQL
```bash
# Abrir MySQL desde terminal
mysql -u root -p whatsapp_dashboard < database/schema.sql
```

O copiar el contenido de `database/schema.sql` y ejecutarlo en tu cliente MySQL.

### 4. Configurar variables de entorno

Copia `.env.example` a `.env` y actualiza con tus datos:
```bash
cp .env.example .env
```

Edita `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=whatsapp_dashboard
DB_PORT=3306
SERVER_PORT=3000
NODE_ENV=development
```

## ▶️ Ejecutar la Aplicación

### Modo Desarrollo
```bash
npm run dev
```

### Modo Producción
```bash
npm start
```

La aplicación estará disponible en: `http://localhost:3000`

## 👥 Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@dashboard.com | password123 | Administrador |
| supervisor@dashboard.com | password123 | Supervisor |
| operador@dashboard.com | password123 | Operador |
| operador2@dashboard.com | password123 | Operador |

## 🎨 Estructura de Fases

El tablero se divide en 6 columnas principales:

1. **Recepción** 🔴 - Nuevos mensajes sin procesar
2. **Orden** 🟠 - Mensajes que requieren acción
3. **En empaquetado** 🔵 - Siendo preparados
4. **Lista para Entrega** 🟣 - Listos para enviar
5. **En ruta** 🌊 - En camino al cliente
6. **Entregado** 🟢 - Completados

## 📊 Estructura de Base de Datos

### Tablas Principales

- **chat_mensajes** - Mensajes originales de WhatsApp
- **chat_solicitud** - Solicitudes en el flujo Kanban
- **chat_evento** - Historial de cambios y acciones
- **usuarios** - Usuarios del sistema con roles
- **permisos_rol** - Permisos según rol

## 🔐 Permisos por Rol

### Administrador
- Ver todos los mensajes y solicitudes
- Cambiar estados de cualquier solicitud
- Gestionar usuarios
- Ver reportes

### Supervisor
- Ver todos los mensajes y solicitudes
- Cambiar estados de solicitudes asignadas
- Asignar solicitudes a operadores
- Ver reportes

### Operador
- Ver solicitudes asignadas
- Cambiar estados solo de sus solicitudes
- Agregar comentarios

## 🔄 Flujo de Trabajo

1. **Mensaje Llega** → Se registra en `chat_mensajes`
2. **Crear Solicitud** → Se crea registro en `chat_solicitud` (Recepción)
3. **Mover Entre Fases** → Drag & Drop entre columnas
4. **Registrar Evento** → Se guarda en `chat_evento` con detalles
5. **Completar** → Cuando llega a "Entregado"

## 📱 Características de UX/UI

- **Colores Intuitivos** - Cada fase tiene su color identificador
- **Contadores de Tarjetas** - Muestra cantidad en cada columna
- **Notificaciones** - Feedback visual de acciones
- **Modo Responsivo** - Funciona en desktop, tablet y móvil
- **Filtros** - Por fecha y estado
- **Modal de Detalles** - Ver información completa de cada solicitud
- **Historial Visual** - Timeline de cambios con usuario y rol

## 🛠️ Tecnologías Utilizadas

**Frontend**
- HTML5
- CSS3 (Flexbox, Grid, Gradientes)
- JavaScript Vanilla (Sin dependencias externas)
- Font Awesome para iconos

**Backend**
- Node.js
- Express.js
- MySQL2/Promise

**Base de Datos**
- MySQL

## 📁 Estructura de Carpetas

```
DashBoard-Whatsapp/
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── kanban.js
│   └── img/
├── views/
│   └── index.html
├── routes/
│   ├── mensajes.js
│   ├── solicitudes.js
│   ├── eventos.js
│   └── usuarios.js
├── config/
│   ├── database.js
│   └── constantes.js
├── controllers/
├── models/
├── database/
│   └── schema.sql
├── app.js
├── package.json
└── .env
```

## 🐛 Troubleshooting

### Error de conexión a MySQL
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solución:** Verifica que MySQL está corriendo y los datos en `.env` son correctos

### Puerto 3000 en uso
```
Error: listen EADDRINUSE :::3000
```
**Solución:** Cambia en `.env` el `SERVER_PORT` a otro puerto disponible

### No aparecen datos en el tablero
- Verifica que los datos de conexión en `.env` son correctos
- Revisa en MySQL que la base de datos y tablas existen
- Consulta la consola para errores de conexión

## 🚀 Próximas Mejoras Planeadas

- [ ] Sistema de login y autenticación
- [ ] Exportar reportes en PDF/Excel
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Calendario de entregas
- [ ] Métricas y estadísticas avanzadas
- [ ] Integración con API de WhatsApp oficial
- [ ] Sistema de caché Redis
- [ ] Pruebas unitarias

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## ✉️ Contacto y Soporte

Para reportar bugs o sugerencias, contacta al equipo de desarrollo.

---

**Versión:** 1.0.0  
**Última actualización:** Mayo 2024
