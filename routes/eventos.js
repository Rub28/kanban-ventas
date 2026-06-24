const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET - Obtener eventos
router.get('/', async (req, res) => {
  try {
    const { solicitud_id } = req.query;
    const connection = await pool.getConnection();
    
    let query = 'SELECT * FROM chat_evento';
    let params = [];
    
    if (solicitud_id) {
      query += ' WHERE solicitud_id = ?';
      params.push(solicitud_id);
    }
    
    query += ' ORDER BY fh_evento DESC';
    
    const [eventos] = await connection.query(query, params);
    connection.release();
    
    res.json(eventos);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

// POST - Crear evento
router.post('/', async (req, res) => {
  try {
    const {
      solicitud_id,
      estado_anterior,
      estado_nuevo,
      accion,
      comentario,
      usuario_id,
      usuario_nombre,
      rol
    } = req.body;
    
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO chat_evento (solicitud_id, estado_anterior, estado_nuevo, accion, comentario, usuario_id, usuario_nombre, rol, fh_evento)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [solicitud_id, estado_anterior, estado_nuevo, accion, comentario, usuario_id, usuario_nombre, rol]
    );
    
    connection.release();
    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

module.exports = router;
