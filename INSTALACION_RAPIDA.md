# 🚀 Guía Rápida de Instalación

Sigue estos pasos para tener el tablero funcionando en menos de 10 minutos.

## Paso 1: Preparar la Base de Datos

### Opción A: Usando MySQL desde Terminal

```bash
# 1. Conectarse a MySQL
mysql -u root -p

# 2. En el prompt de MySQL, ejecuta:
CREATE DATABASE whatsapp_dashboard;
USE whatsapp_dashboard;
SOURCE database/schema.sql;
```

### Opción B: Usando MySQL Workbench o PhpMyAdmin

1. Crea una nueva BD llamada `whatsapp_dashboard`
2. Selecciónala
3. Abre el archivo `database/schema.sql`
4. Copia todo el contenido
5. Pega en el editor de SQL y ejecuta

## Paso 2: Configurar Variábles de Entorno

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env con tus datos (usa tu editor favorito)
# Cambia:
# - DB_PASSWORD por tu contraseña MySQL
# - DB_USER si no es "root"
# - DB_HOST si no es localhost
```

## Paso 3: Instalar Dependencias

```bash
npm install
```

## Paso 4: Iniciar la Aplicación

### Para Desarrollo
```bash
npm run dev
```

### Para Producción
```bash
npm start
```

## Paso 5: Acceder

Abre en tu navegador: `http://localhost:3000`

---

## ✅ Verificar que todo funciona

1. ✅ El tablero carga correctamente
2. ✅ Aparecen 5 mensajes de ejemplo
3. ✅ Puedes ver el usuario logueado en la esquina superior derecha
4. ✅ Los contadores muestran números correctos
5. ✅ Puedes hacer drag & drop de tarjetas

## 🎨 Primeros Pasos

1. **Explora las tarjetas** - Haz clic en una para ver detalles
2. **Prueba el drag & drop** - Arrastra una tarjeta a otra columna
3. **Mira el historial** - Haz clic en el icono de reloj para ver cambios
4. **Agrega comentarios** - Abre una tarjeta y comenta

## 🆘 Necesitas Ayuda?

### El tablero no carga
- ✅ Verifica que Node está ejecutando sin errores
- ✅ Abre la consola del navegador (F12) para ver errores
- ✅ Verifica en terminal que no hay errores

### No aparecen datos
- ✅ Verifica que la BD está creada: `SHOW DATABASES;`
- ✅ Verifica que tiene datos: `SELECT COUNT(*) FROM chat_mensajes;`
- ✅ Revisa la consola del servidor para errores de conexión

### La BD no conecta
- ✅ Verifica que MySQL está corriendo
- ✅ Verifica usuario y contraseña en .env
- ✅ Intenta conectar desde consola: `mysql -u root -p`

## 📝 Notas Importantes

- La aplicación usa datos de ejemplo para demostración
- Los usuarios de ejemplo pueden consultarse en `database/schema.sql`
- Todos los cambios se guardan automáticamente en BD
- El historial de cambios se registra en cada acción

## 🎯 Próximos Pasos

Después de que funcione:

1. Agrega tus propios usuarios en la tabla `usuarios`
2. Conecta tu API de WhatsApp para recibir mensajes en tiempo real
3. Personaliza los colores y estilos según tu marca
4. Configura un servidor para producción

---

¡Listo para empezar! Si tienes problemas, revisa el README.md para más información.
