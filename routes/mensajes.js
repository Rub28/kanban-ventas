const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET - Obtener todos los mensajes
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [mensajes] = await connection.query(
      `SELECT m.*, 
              COALESCE(s.estado, 'Recepción') as estado,
              COALESCE(s.asignado_a, 'Sin asignar') as asignado_a,
              s.id as solicitud_id
       FROM chat_mensajes m
       LEFT JOIN chat_solicitud s ON m.id = s.mensaje_id
       ORDER BY m.fh_registro DESC`
    );
    connection.release();
    
    res.json(mensajes);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

// GET - Obtener un mensaje específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [mensajes] = await connection.query(
      'SELECT * FROM chat_mensajes WHERE id = ?',
      [id]
    );
    connection.release();
    
    if (mensajes.length === 0) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }
    
    res.json(mensajes[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener mensaje' });
  }
});

module.exports = router;
