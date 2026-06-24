# ❓ Preguntas Frecuentes (FAQ)

## Instalación y Setup

### P: ¿Qué necesito para ejecutar el proyecto?
**R:** 
- Node.js 14+ ([descargar](https://nodejs.org))
- MySQL 5.7+ ([descargar](https://www.mysql.com/downloads/mysql/))
- Un editor de código (VS Code recomendado)
- Tu navegador favorito

### P: ¿Por qué no funciona después de instalar?
**R:** Revisa en este orden:
1. ¿MySQL está corriendo? `sudo service mysql status`
2. ¿npm install completó sin errores?
3. ¿Las variables en .env son correctas?
4. ¿La BD se creó? `SHOW DATABASES;`
5. ¿Las tablas existen? `SHOW TABLES;`

### P: ¿Puedo usar SQLite en lugar de MySQL?
**R:** Técnicamente sí, pero tendrías que:
- Cambiar la librería de conexión
- Actualizar los querys SQL
- Adaptar el config/database.js
Se recomienda mantener MySQL.

### P: ¿Necesito crear manualmente la BD?
**R:** Sí, pero es fácil:
```bash
# Opción 1: Desde terminal
mysql -u root -p whatsapp_dashboard < database/schema.sql

# Opción 2: Manualmente en MySQL Workbench
# Crear BD → Ejecutar script
```

---

## Uso del Tablero

### P: ¿Cómo agrego nuevos usuarios?
**R:** 
```sql
INSERT INTO usuarios 
(nombre, email, rol, estado) 
VALUES 
('Juan', 'juan@example.com', 'Operador', 1);
```

### P: ¿Por qué no puedo mover tarjetas?
**R:** Posibles razones:
- La BD no está actualizada
- JavaScript tiene errores (revisa F12)
- No tienes permisos en ese estado
- La conexión a BD se cortó

### P: ¿Cómo cambio mis permisos?
**R:**
```sql
UPDATE usuarios 
SET rol = 'Supervisor' 
WHERE email = 'tu@example.com';
```

### P: ¿Se guarda todo automáticamente?
**R:** ✅ Sí, cada cambio se guarda en:
- Tabla `chat_solicitud` (estado)
- Tabla `chat_evento` (historial)
- Los cambios son inmediatos

---

## Datos y Base de Datos

### P: ¿Dónde ver todos los cambios realizados?
**R:**
```sql
SELECT * FROM chat_evento 
ORDER BY fh_evento DESC 
LIMIT 20;
```

### P: ¿Puedo hacer backup de los datos?
**R:** Sí, desde terminal:
```bash
# Hacer backup
mysqldump -u root -p whatsapp_dashboard > backup.sql

# Restaurar backup
mysql -u root -p whatsapp_dashboard < backup.sql
```

### P: ¿Qué pasa si borro una solicitud?
**R:** Los eventos (historial) se borran automáticamente también gracias a `ON DELETE CASCADE`.

### P: ¿Puedo exportar reportes?
**R:** Ahora no, pero puedes hacerlo con:
```sql
SELECT 
  s.id,
  m.pushName,
  m.phone_number,
  s.estado,
  s.fh_creacion
FROM chat_solicitud s
JOIN chat_mensajes m ON s.mensaje_id = m.id
WHERE DATE(s.fh_creacion) = CURDATE()
INTO OUTFILE '/tmp/reporte_hoy.csv'
FIELDS TERMINATED BY ',';
```

---

## Desarrollo y Customización

### P: ¿Cómo cambio los colores del tablero?
**R:** En `public/css/styles.css`:
```css
:root {
  --primary-color: #2ecc71;  /* Cambia esto */
  --danger-color: #e74c3c;   /* O esto */
}
```

### P: ¿Puedo cambiar los nombres de las fases?
**R:** Sí, pero debes actualizar:
1. La BD (enum en tabla)
2. El HTML (nombres en columnas)
3. El JavaScript (formatoId, constantes)

### P: ¿Cómo agrego una nueva fase?
**R:** Sigue la "Guía de Extensiones" en GUIA_EXTENSIONES.md

### P: ¿Puedo usar frameworks como React?
**R:** Sí, pero tendrías que reescribir el frontend. Ahora usa vanilla JavaScript.

### P: ¿Qué librerías usas?
**R:** Solo:
- Express (backend)
- MySQL2 (BD)
- Font Awesome (iconos)
- Todo lo demás es código puro 🚀

---

## Errores Comunes

### P: "Error: connect ECONNREFUSED"
**R:** MySQL no está corriendo:
```bash
# Windows
net start MySQL80

# Linux
sudo service mysql start

# Mac
brew services start mysql-community-server
```

### P: "Port 3000 already in use"
**R:** Otro programa usa ese puerto:
```bash
# Cambiar en .env
SERVER_PORT=3001

# O liberar el puerto
lsof -i :3000
kill -9 <PID>
```

### P: "Cannot read property 'push' of undefined"
**R:** Error en JavaScript, revisa:
- Consola del navegador (F12)
- Terminal donde corre Node.js
- Que la BD tenga datos

### P: "No data appears on the board"
**R:**
1. Verifica `SELECT * FROM chat_mensajes;`
2. Verifica conexión en terminal
3. Recarga la página (Ctrl+F5)
4. Revisa la consola (F12)

### P: "403 Forbidden" en API
**R:** Probablemente CORS o autenticación. Verifica:
- Headers en la petición
- Configuración CORS en app.js
- Que la BD esté disponible

---

## Rendimiento y Escalabilidad

### P: ¿Cuántos usuarios puede soportar?
**R:** Con optimizaciones:
- 5-10 simultáneamente sin problemas
- 100+ con caché (Redis)
- 1000+ con arquitectura en microservicios

### P: ¿Qué pasa con muchos mensajes?
**R:** Considera:
- Agregar índices a BD
- Paginar resultados
- Usar caché
- Archivar mensajes antiguos

### P: ¿Es seguro para producción?
**R:** No aún. Necesitas:
- Autenticación real (JWT, OAuth)
- HTTPS/SSL
- Validación de datos
- Rate limiting
- Logs de auditoría

---

## Integración con WhatsApp

### P: ¿Cómo conecto WhatsApp?
**R:** Lee INTEGRACION_WHATSAPP.md - hay 3 opciones:
- API Oficial (recomendado)
- Baileys (desarrollo)
- Twilio (confiable)

### P: ¿Los mensajes llegan en tiempo real?
**R:** Cuando tengas los webhooks conectados, sí. Ahora trae datos estáticos de ejemplo.

### P: ¿Puedo enviar mensajes desde aquí?
**R:** No en esta fase 1, pero es fácil agregar después.

---

## Soporte y Debugging

### P: ¿Dónde veo los errores?
**R:** En 3 lugares:
1. **Terminal (Node.js)** - Errores del servidor
2. **Navegador (F12)** - Errores del cliente
3. **MySQL** - Errores de BD

### P: ¿Cómo hago debugging?
**R:**
```javascript
// En JavaScript
console.log('Valor:', valor);
console.table(array);
console.error('Error:', error);

// En Node.js
console.log('Log:', variableBackend);

// En SQL
SELECT * FROM tabla;
SHOW ERRORS;
```

### P: ¿A quién contacto si tengo problemas?
**R:** Revisa en este orden:
1. Lee README.md
2. Lee INSTALACION_RAPIDA.md
3. Mira los EJEMPLOS_USO.md
4. Revisa la consola de errores
5. Contacta al equipo con screenshot del error

---

## Mejoras Futuras

### P: ¿Cuándo habrá autenticación?
**R:** Se puede agregar ahora. Ver GUIA_EXTENSIONES.md sección "Implementar Autenticación".

### P: ¿Cuándo habrá reportes en PDF?
**R:** Es fácil con html2pdf. Ver GUIA_EXTENSIONES.md.

### P: ¿Cuándo habrá notificaciones en tiempo real?
**R:** Con Socket.IO. Ver GUIA_EXTENSIONES.md sección "Notificaciones".

### P: ¿Esto será compatible con mobile?
**R:** ✅ Ya es responsive. Funciona en:
- Escritorio (óptimo)
- Tablet (bueno)
- Móvil (funciona pero mejor ver en landscape)

---

## Licencia y Legal

### P: ¿Puedo usar esto comercialmente?
**R:** Sí, es ISC License (muy permisivo).

### P: ¿Puedo modificar el código?
**R:** Claro, es tu proyecto.

### P: ¿Debo créditos a alguien?
**R:** Solo menciona las librerías usadas (Express, MySQL2, Font Awesome).

---

## Contacto y Comunidad

### P: ¿Hay más documentación?
**R:** Sí:
- README.md - General
- INSTALACION_RAPIDA.md - Setup
- GUIA_EXTENSIONES.md - Cómo extender
- EJEMPLOS_USO.md - Casos prácticos
- ESTRUCTURA.md - Detalles técnicos
- INTEGRACION_WHATSAPP.md - WhatsApp
- Este FAQ - Preguntas frecuentes

### P: ¿Puedo contribuir mejoras?
**R:** ¡Por supuesto! Estamos abiertos a:
- Nuevas features
- Optimizaciones
- Documentación mejorada
- Bug fixes
- Diseño mejorado

---

## ¿No encontraste tu pregunta?

Si tu duda no está aquí:
1. Busca en la documentación (.md)
2. Revisa los comentarios en el código
3. Prueba buscando en Google el error exacto
4. Contacta al equipo con detalles

---

**¡Espero haber resuelto tus dudas! 🚀**

Si tienes más preguntas, siéntete libre de agregar a este FAQ.
