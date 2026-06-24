# 📱 Integración con API WhatsApp (Guía)

Este documento explica cómo conectar tu tablero con la API real de WhatsApp.

## 🔐 Opciones de Integración

### Opción 1: WhatsApp Official API (Recomendado)
- ✅ Oficial y soportado por Meta
- ✅ Mejor documentación
- ✅ Webhooks en tiempo real
- ❌ Requiere aprobación de negocio
- ❌ Costo de mensajes

### Opción 2: Baileys (No oficial - Local)
- ✅ Funciona sin aprobación
- ✅ Gratis
- ✅ Ideal para desarrollo/pruebas
- ❌ No es oficial
- ❌ Puede dejar de funcionar sin aviso

### Opción 3: Twilio
- ✅ Confiable
- ✅ Documentación completa
- ❌ Requiere pago
- ❌ Dependencia externa

---

## 📖 Guía: WhatsApp Official API

### Paso 1: Configurar Meta/Facebook Business

1. Ir a https://developers.facebook.com/
2. Crear aplicación de prueba
3. Agregar producto WhatsApp
4. Seguir los pasos de verificación

### Paso 2: Obtener Tokens

```
- Phone Number ID
- Business Account ID
- Access Token (válido 60 días)
```

### Paso 3: Instalar SDK

```bash
npm install @open-wa/wa-automate
# O para Official API:
npm install axios
```

### Paso 4: Crear Servicio de WhatsApp

Crea archivo `services/whatsapp.js`:

```javascript
const axios = require('axios');
const pool = require('../config/database');

class WhatsAppService {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_ID;
    this.baseUrl = `https://graph.instagram.com/v18.0/${this.phoneNumberId}`;
  }

  // Recibir webhooks de mensajes
  async procesarMensajeEntrante(data) {
    try {
      const mensaje = data.entry[0].changes[0].value;
      
      if (mensaje.messages) {
        for (const msg of mensaje.messages) {
          await this.guardarMensaje(msg);
        }
      }
    } catch (error) {
      console.error('Error procesando mensaje:', error);
    }
  }

  // Guardar mensaje en BD
  async guardarMensaje(msg) {
    try {
      const connection = await pool.getConnection();
      
      const contact = msg.from;
      const texto = msg.text?.body || 'Mensaje sin texto';
      
      // Obtener información del contacto si existe
      const contactInfo = await this.obtenerContacto(contact);
      
      const [result] = await connection.query(
        `INSERT INTO chat_mensajes 
        (pushName, phone_number, mensaje, remoteJid, fh_registro)
        VALUES (?, ?, ?, ?, NOW())`,
        [contactInfo.name, contact, texto, contact]
      );

      connection.release();
      
      // Crear solicitud automáticamente
      await this.crearSolicitud(result.insertId);
      
      return result;
    } catch (error) {
      console.error('Error guardando mensaje:', error);
    }
  }

  // Crear solicitud automáticamente
  async crearSolicitud(mensajeId) {
    try {
      const connection = await pool.getConnection();
      
      await connection.query(
        `INSERT INTO chat_solicitud (mensaje_id, estado, fh_creacion)
        VALUES (?, 'Recepción', NOW())`,
        [mensajeId]
      );
      
      connection.release();
    } catch (error) {
      console.error('Error creando solicitud:', error);
    }
  }

  // Obtener información del contacto
  async obtenerContacto(phone) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/contacts?phone_number=${phone}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      
      return response.data[0] || { name: 'Cliente' };
    } catch (error) {
      console.log('No se pudo obtener info del contacto');
      return { name: 'Cliente' };
    }
  }

  // Enviar mensaje de confirmación
  async enviarConfirmacion(phone, mensaje) {
    try {
      await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: mensaje }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Error enviando confirmación:', error);
    }
  }
}

module.exports = new WhatsAppService();
```

### Paso 5: Crear Endpoint para Webhook

En `routes/webhooks.js`:

```javascript
const express = require('express');
const router = express.Router();
const whatsapp = require('../services/whatsapp');

// Webhook para recibir mensajes
router.post('/whatsapp', (req, res) => {
  console.log('Webhook recibido:', req.body);
  
  whatsapp.procesarMensajeEntrante(req.body);
  
  // Responder inmediatamente a Meta
  res.status(200).send({ status: 'ok' });
});

// Verificar webhook (Meta requiere esto)
router.get('/whatsapp', (req, res) => {
  const token = process.env.WEBHOOK_TOKEN;
  const mode = req.query['hub.mode'];
  const verify_token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && verify_token === token) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Error de verificación');
  }
});

module.exports = router;
```

### Paso 6: Agregar al servidor

En `app.js`:

```javascript
// Agregar línea:
app.use('/webhooks', require('./routes/webhooks'));
```

### Paso 7: Variables de Entorno

Agrega a `.env`:

```
WHATSAPP_ACCESS_TOKEN=tu_token_aqui
WHATSAPP_PHONE_ID=tu_phone_id_aqui
WEBHOOK_TOKEN=token_secreto_para_verificacion
WHATSAPP_API_VERSION=v18.0
```

---

## 🎮 Guía: Baileys (Para Desarrollo)

### Paso 1: Instalar Baileys

```bash
npm install @whiskeysockets/baileys qrcode-terminal
```

### Paso 2: Crear Servicio

Crea archivo `services/baileys.js`:

```javascript
const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pool = require('../config/database');

const { state, saveState } = useSingleFileAuthState('./auth.json');

async function conectarWhatsApp() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveState);

  // Cuando se recibe un mensaje
  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];

    if (!msg.key.fromMe && msg.message) {
      try {
        // Guardar mensaje
        const texto = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || 
                     'Mensaje multimedia';

        const from = msg.key.remoteJid.split('@')[0];
        
        const connection = await pool.getConnection();
        
        const [result] = await connection.query(
          `INSERT INTO chat_mensajes 
          (pushName, phone_number, mensaje, remoteJid, fh_registro)
          VALUES (?, ?, ?, ?, NOW())`,
          [msg.pushName || 'Cliente', from, texto, msg.key.remoteJid]
        );

        // Crear solicitud
        await connection.query(
          `INSERT INTO chat_solicitud (mensaje_id, estado)
          VALUES (?, 'Recepción')`,
          [result.insertId]
        );

        connection.release();

        // Enviar confirmación
        await sock.sendMessage(msg.key.remoteJid, {
          text: '✅ Tu mensaje fue recibido. Te atenderemos pronto.'
        });

      } catch (error) {
        console.error('Error:', error);
      }
    }
  });

  return sock;
}

module.exports = { conectarWhatsApp };
```

### Paso 3: Iniciar en app.js

```javascript
const { conectarWhatsApp } = require('./services/baileys');

// Al iniciar el servidor:
conectarWhatsApp().then(sock => {
  console.log('✅ WhatsApp conectado con Baileys');
}).catch(err => {
  console.error('Error conectando WhatsApp:', err);
});
```

---

## 🧪 Testear Integración

### Con Postman o curl

```bash
# Simular mensaje entrante
curl -X POST http://localhost:3000/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "34612345678",
            "id": "msg_123",
            "timestamp": 1234567890,
            "type": "text",
            "text": {
              "body": "Hola, esto es un test"
            }
          }]
        }
      }]
    }]
  }'
```

### Verificar en Base de Datos

```sql
-- Ver último mensaje recibido
SELECT * FROM chat_mensajes ORDER BY id DESC LIMIT 1;

-- Ver solicitud creada
SELECT * FROM chat_solicitud ORDER BY id DESC LIMIT 1;
```

---

## 🚀 Deployment

### Para Producción con Official API

1. **Obtener dominio con SSL**
   ```
   https://mi-dominio.com (necesario para webhooks)
   ```

2. **Configurar webhook en Meta**
   ```
   URL: https://mi-dominio.com/webhooks/whatsapp
   Token: Tu token secreto
   ```

3. **Obtener certificado SSL**
   ```bash
   # Con Let's Encrypt
   sudo certbot certonly --standalone -d mi-dominio.com
   ```

4. **Usar en Node.js**
   ```javascript
   const https = require('https');
   const fs = require('fs');
   
   const options = {
     key: fs.readFileSync('/etc/letsencrypt/live/mi-dominio.com/privkey.pem'),
     cert: fs.readFileSync('/etc/letsencrypt/live/mi-dominio.com/fullchain.pem')
   };
   
   https.createServer(options, app).listen(443);
   ```

---

## 📊 Flujo Completo de Integración

```
Cliente envía WhatsApp
        ↓
Meta recibe mensaje
        ↓
Webhook notifica a tu servidor
        ↓
Tu app procesa con whatsapp.js
        ↓
Guardar en chat_mensajes
        ↓
Crear solicitud en chat_solicitud
        ↓
Frontend recarga datos
        ↓
Tarjeta aparece en Recepción
        ↓
Operador puede moverla
```

---

## ⚠️ Consideraciones Importantes

1. **Rate Limiting** - Meta limita mensajes, implementa cola
2. **Errores** - Implementa retry automático
3. **Privacidad** - Cumple GDPR/LGPD
4. **Seguridad** - Valida tokens, usa HTTPS
5. **Backup** - Guarda mensajes en BD
6. **Logs** - Registra todo para debug

---

## 📚 Referencias Útiles

- [WhatsApp Official API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Baileys GitHub](https://github.com/WhiskeySockets/Baileys)
- [Twilio WhatsApp](https://www.twilio.com/whatsapp)

---

¡Tu tablero ahora está completamente integrado! 🎉
