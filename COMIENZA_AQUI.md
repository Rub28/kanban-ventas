# 🎯 COMIENZA AQUÍ - Guía de Inicio Rápido

¡Bienvenido al Dashboard WhatsApp! 👋

Este archivo te guiará en los primeros pasos. **Lee esto primero antes de nada.**

## ⚡ Instalación en 5 minutos

### 1️⃣ Base de Datos
```bash
# Abre terminal en la carpeta del proyecto y ejecuta:
mysql -u root -p whatsapp_dashboard < database/schema.sql
```
> Si pide contraseña, ingresa tu contraseña MySQL

### 2️⃣ Configuración
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Abre .env y cambia:
# - DB_PASSWORD por tu contraseña MySQL
```

### 3️⃣ Instalar Dependencias
```bash
npm install
```

### 4️⃣ Iniciar
```bash
npm run dev
```

### 5️⃣ Abrir
```
Abre: http://localhost:3000
```

## ✅ Verificar que funciona

1. ✅ La página carga
2. ✅ Ves 5 tarjetas de ejemplo
3. ✅ Puedes arrastar tarjetas entre columnas
4. ✅ Aparece tu nombre en arriba a la derecha

**¡Listo! 🎉**

---

## 📚 Documentación (Léelo en orden)

| # | Documento | Cuándo leer | Tiempo |
|---|-----------|-----------|--------|
| 1️⃣ | **Este archivo** | AHORA | 5 min |
| 2️⃣ | [README.md](README.md) | Entender el proyecto | 10 min |
| 3️⃣ | [INSTALACION_RAPIDA.md](INSTALACION_RAPIDA.md) | Si tuviste problemas | 10 min |
| 4️⃣ | [EJEMPLOS_USO.md](EJEMPLOS_USO.md) | Ver casos prácticos | 15 min |
| 5️⃣ | [ESTRUCTURA.md](ESTRUCTURA.md) | Entender carpetas/archivos | 10 min |
| 6️⃣ | [GUIA_EXTENSIONES.md](GUIA_EXTENSIONES.md) | Agregar nuevas features | 20 min |
| 7️⃣ | [INTEGRACION_WHATSAPP.md](INTEGRACION_WHATSAPP.md) | Conectar con WhatsApp | 15 min |
| 8️⃣ | [FAQ.md](FAQ.md) | Resolver problemas | Según necesites |

---

## 🎯 Ahora Qué?

### Opción A: Explorar (Recomendado para primeros 30 min)
1. Haz clic en una tarjeta
2. Lee los detalles
3. Mira el historial
4. Arrastra tarjetas entre columnas
5. Prueba los filtros

### Opción B: Personalizar
1. Lee GUIA_EXTENSIONES.md
2. Cambia los colores
3. Agrega nuevas fases
4. Personaliza según tu negocio

### Opción C: Conectar WhatsApp
1. Lee INTEGRACION_WHATSAPP.md
2. Elige tu opción de integración
3. Sigue los pasos

---

## 🎨 Lo que Ves

```
┌─ HEADER ─────────────────────────────────┐
│  Gestor de Mensajes WhatsApp             │
│                      Tu Nombre (Operador) │
└──────────────────────────────────────────┘

┌─ FILTROS ────────────────────────────────┐
│ Fecha: ______  Estado: ______  [Actualizar]
└──────────────────────────────────────────┘

┌─ TABLERO KANBAN ─────────────────────────┐
│                                          │
│ Recepción  │ Orden  │ Empaquetado │ ...  │
│ ┌───────┐  │        │             │      │
│ │ Card  │  │        │             │      │
│ │ Card  │  │        │             │      │
│ └───────┘  │        │             │      │
│            │        │             │      │
└──────────────────────────────────────────┘
```

---

## 🎮 Controles Básicos

| Acción | Cómo |
|--------|------|
| **Ver detalles** | Haz clic en una tarjeta |
| **Mover tarjeta** | Arrastra a otra columna |
| **Ver historial** | Haz clic en el reloj 🕐 |
| **Agregar comentario** | Abre detalles → escribe → envía |
| **Filtrar por fecha** | Selecciona fecha → automático |
| **Filtrar por estado** | Selecciona estado → automático |
| **Actualizar datos** | Haz clic en "Actualizar" ↻ |

---

## 🔑 Usuarios de Prueba

```
Email: operador@dashboard.com
Contraseña: password123
Rol: Operador

(Otros usuarios en FAQ.md)
```

---

## 💡 Tips Importantes

💾 **Todo se guarda automáticamente** - No necesitas presionar "Guardar"

📊 **Historial completo** - Cada acción se registra con usuario y hora

🔒 **Permisos por rol** - Lo que ves depende de tu perfil

📱 **Responsivo** - Funciona en móvil, tablet y escritorio

🎨 **Personalizable** - Cambia colores, fases, usuarios fácilmente

---

## ⚠️ Problemas Comunes

### "No aparecen datos"
✅ Verifica que MySQL está corriendo  
✅ Revisa la consola (F12) para errores  
✅ Recarga la página (Ctrl+F5)  

### "Puerto 3000 en uso"
✅ Cambia el puerto en .env  
✅ O mata el proceso: `lsof -i :3000 | kill -9`

### "Error de conexión a BD"
✅ Verifica usuario y contraseña en .env  
✅ Verifica que la BD existe: `SHOW DATABASES;`  
✅ Verifica que las tablas existen: `SHOW TABLES;`  

→ Lee [FAQ.md](FAQ.md) para más problemas

---

## 📦 Carpetas Principales

```
📁 public/         ← Frontend (CSS, JavaScript, Imágenes)
📁 views/          ← HTML del tablero
📁 routes/         ← APIs REST
📁 config/         ← Configuración
📁 database/       ← Scripts SQL
📄 app.js          ← Servidor principal
```

---

## 🚀 Siguientes Pasos

### Semana 1: Familiarizarse
- [ ] Instalar y ejecutar ✅ Ya lo hiciste
- [ ] Explorar todas las características
- [ ] Leer la documentación
- [ ] Crear usuarios nuevos

### Semana 2: Personalizar
- [ ] Cambiar colores y nombre
- [ ] Agregar nuevas fases si necesita
- [ ] Crear usuarios reales
- [ ] Probar flujos de trabajo

### Semana 3: Integrar WhatsApp
- [ ] Leer INTEGRACION_WHATSAPP.md
- [ ] Elegir opción de integración
- [ ] Conectar API
- [ ] Recibir mensajes reales

### Semana 4: Deploy
- [ ] Configurar servidor
- [ ] Obtener dominio y SSL
- [ ] Implementar autenticación
- [ ] Publicar

---

## 🤝 Necesitas Ayuda?

1. **Revisa la documentación** - Probablemente está ahí
2. **Mira los ejemplos** - En EJEMPLOS_USO.md
3. **Consulta FAQ.md** - Preguntas frecuentes
4. **Revisa la consola** - F12 en navegador
5. **Contacta al equipo** - Si nada funciona

---

## 📞 Información de Contacto

**Para soporte técnico:**
```
Email: soporte@dashboard.com
Documentación: Mira los .md en la carpeta
```

---

## 🎉 ¡Felicidades!

Ya tienes un tablero Kanban profesional funcionando. 

**Ahora:**
1. ✅ Instálalo completamente
2. ✅ Explora todas las características
3. ✅ Personaliza según tus necesidades
4. ✅ Integra con WhatsApp
5. ✅ ¡Úsalo en tu negocio!

---

**¿Todo claro? ¡Adelante! 🚀**

Próximo paso: Lee [README.md](README.md) para entender mejor el proyecto.
