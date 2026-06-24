const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET - Obtener solicitudes
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [solicitudes] = await connection.query(
      `SELECT s.*, m.pushName, m.phone_number, m.mensaje, m.fh_registro
       FROM chat_solicitud s
       LEFT JOIN chat_mensajes m ON s.mensaje_id = m.id
       ORDER BY s.fh_creacion DESC`
    );
    connection.release();
    
    res.json(solicitudes);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
});

// POST - Crear solicitud
router.post('/', async (req, res) => {
  try {
    const { mensaje_id, estado } = req.body;
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO chat_solicitud (mensaje_id, estado, fh_creacion)
       VALUES (?, ?, NOW())`,
      [mensaje_id, estado || 'Recepción']
    );
    
    connection.release();
    res.json({ id: result.insertId, mensaje_id, estado });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al crear solicitud' });
  }
});

// PUT - Actualizar solicitud
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, estadoAnterior, usuarioId, nombreUsuario, rolUsuario, comentario } = req.body;
    
    const connection = await pool.getConnection();
    
    // Actualizar solicitud
    await connection.query(
      'UPDATE chat_solicitud SET estado = ?, fh_actualizacion = NOW() WHERE id = ?',
      [estado, id]
    );
    
    // Registrar evento
    await connection.query(
      `INSERT INTO chat_evento (solicitud_id, estado_anterior, estado_nuevo, accion, comentario, usuario_id, usuario_nombre, rol, fh_evento)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, estadoAnterior, estado, 'Cambio de estado', comentario, usuarioId, nombreUsuario, rolUsuario]
    );
    
    connection.release();
    res.json({ success: true, id, estado });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al actualizar solicitud' });
  }
});

module.exports = router;
