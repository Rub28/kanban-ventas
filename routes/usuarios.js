const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET - Obtener usuarios
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [usuarios] = await connection.query(
      'SELECT id, nombre, email, rol, estado FROM usuarios WHERE estado = 1 ORDER BY nombre'
    );
    connection.release();
    
    res.json(usuarios);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// GET - Obtener clientes únicos desde chat_mensajes
router.get('/clientes/lista', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [clientes] = await connection.query(
      `SELECT DISTINCT 
        pushName as nombre,
        phone_number as telefono
       FROM chat_mensajes 
       WHERE pushName IS NOT NULL AND pushName != ''
       ORDER BY pushName ASC`
    );
    connection.release();
    
    res.json(clientes);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

module.exports = router;
