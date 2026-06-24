# 🎯 Ejemplos de Uso del Tablero

Este documento muestra ejemplos de cómo usar y customizar el tablero.

## 📊 Caso de Uso: Gestión de Pedidos

### Flujo Típico de un Pedido

```
1. Cliente envía mensaje por WhatsApp
   ↓
2. Mensaje se registra en chat_mensajes
   ↓
3. Sistema crea solicitud en Recepción
   ↓
4. Operador ve la tarjeta en la columna Recepción
   ↓
5. Operador mueve a "Orden" (confirma con cliente)
   ↓
6. Operador mueve a "En empaquetado" (se empieza a preparar)
   ↓
7. Operador mueve a "Lista para Entrega" (empaque listo)
   ↓
8. Operador mueve a "En ruta" (se envía con distribuidor)
   ↓
9. Operador mueve a "Entregado" (cliente confirmó recepción)
```

## 🎬 Ejemplos Prácticos

### Ejemplo 1: Nuevo Mensaje en Recepción

**Cliente envía:** "Hola, me interesa comprar los zapatos rojos talla 42"

1. Sistema recibe el mensaje
2. Crea automáticamente una tarjeta en Recepción
3. La tarjeta muestra:
   - Nombre del cliente
   - Número de teléfono
   - Contenido del mensaje
   - Hora de recepción

### Ejemplo 2: Mover entre fases

**Operador María:**
1. Ve la tarjeta del cliente en "Recepción"
2. Lee el mensaje completo haciendo clic en la tarjeta
3. Agrega comentario: "Confirmado con cliente, stock disponible"
4. Arrastra la tarjeta a "Orden"
5. Sistema registra: "María movió a Orden - 14:30"

### Ejemplo 3: Ver Historial Completo

**Supervisor revisa el historial de un pedido:**

```
14:30 - María (Operador)
Cambio: Recepción → Orden
Comentario: "Confirmado con cliente, stock disponible"

14:45 - Carlos (Operador)
Cambio: Orden → En empaquetado
Comentario: "Preparando pedido"

15:20 - Carlos (Operador)
Cambio: En empaquetado → Lista para Entrega
Comentario: "Pedido empacado y etiquetado"

15:25 - Distribuidor (Sistema automático)
Cambio: Lista para Entrega → En ruta
Comentario: "Entregado a distribuidor"

16:45 - Cliente (Automático)
Cambio: En ruta → Entregado
Comentario: "Cliente confirmó recepción"
```

## 👤 Ejemplo de Permisos por Rol

### Administrador (Admin Sistema)
- Acceso: **Todas las tarjetas**
- Puede: Ver, mover, cambiar cualquier estado
- Visto: Si hay 50 tarjetas, ve todas

### Supervisor (Juan Supervisor)
- Acceso: **Tarjetas asignadas a su equipo**
- Puede: Ver y mover solo las asignadas a sus operadores
- Restringe: No puede cambiar si no está asignada

### Operador (María Operador)
- Acceso: **Sus propias tarjetas**
- Puede: Ver y mover solo las suyas
- Restringe: Solo tareas que le asignaron

## 🔄 Ejemplo de Flujo Paralelo

**Múltiples clientes simultáneos:**

```
Recepción:        Orden:              En empaquetado:   Lista Entrega:
- Cliente 1      - Cliente 3         - Cliente 2       - Cliente 5
- Cliente 4      - Cliente 6         - Cliente 7       - Cliente 8
```

El tablero muestra todo en tiempo real, cada operador puede trabajar en su tarjeta.

## 📞 Ejemplo: Manejo de Reclamo

**Cliente envía:** "Recibí mi pedido roto, quiero devuelve"

**Proceso:**
1. Mensaje llega a Recepción
2. Supervisor María ve el reclamo
3. Lee los detalles: "Producto X llegó con daño"
4. Agrega comentario: "Contactar cliente para devolución"
5. Asigna a Carlos (Operador experimentado en reclamaciones)
6. Mueve a "Orden" (se trata como nueva solicitud de devolución)
7. Carlos continúa el proceso desde "Orden"

## 📊 Métricas que Puedes Obtener

**Del historial guardado en chat_evento:**

```sql
-- Tarjetas por operador
SELECT usuario_nombre, COUNT(*) FROM chat_evento
GROUP BY usuario_nombre;

-- Tiempo promedio por fase
SELECT 
  estado_anterior,
  AVG(TIMESTAMPDIFF(MINUTE, fh_evento, NOW())) as minutos
FROM chat_evento
GROUP BY estado_anterior;

-- Operador más rápido
SELECT usuario_nombre, COUNT(*) as acciones
FROM chat_evento
WHERE accion = 'Cambio de estado'
GROUP BY usuario_nombre
ORDER BY acciones DESC;
```

## 🎨 Ejemplo de Personalización

### Cambiar colores para otra industria

**De E-commerce a Atención al Cliente:**

```css
/* Recepción = Ticket nuevo (Rojo urgente) */
.column-header.reception {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

/* Orden = Asignado a agente (Azul) */
.column-header.order {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

/* En empaquetado = En proceso (Naranja) */
.column-header.packing {
  background: linear-gradient(135deg, #f39c12, #d68910);
}

/* Lista Entrega = Resuelto (Verde) */
.column-header.ready {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}
```

## 🚀 Ejemplo: Escalabilidad

**Tablero puede manejar:**
- ✅ 5-10 operadores simultáneamente
- ✅ 100+ tarjetas sin problema
- ✅ Cientos de eventos en historial
- ✅ Escalable a más con optimizaciones

## 🔔 Notificación Personalizada en Modal

En `public/js/kanban.js`, personaliza:

```javascript
function mostrarNotificacion(mensaje, tipo = 'info') {
  // Personalizar mensajes según tipo
  const mensajesCustom = {
    'tarjeta_movida': '✅ Tarjeta movida correctamente',
    'error_movimiento': '❌ No puedes mover esta tarjeta',
    'asignacion_nueva': '📌 Nueva tarjeta asignada a ti',
    'comentario_nuevo': '💬 Nuevo comentario en tu tarjeta'
  };
  
  const mensaje_final = mensajesCustom[tipo] || mensaje;
  // ... mostrar notificación
}
```

## 📱 Ejemplo: Uso en Móvil

En tablet/móvil, el tablero se adapta:
- Una columna por fila (mejor que lado a lado)
- Tarjetas más grandes y fáciles de tocar
- Tooltips en hover para más info
- Botones más grandes

---

¿Necesitas más ejemplos o tienes dudas? ¡Contacta al equipo! 🎉
