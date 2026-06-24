const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET - Obtener todos los eventos de campañas
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [eventos] = await connection.query(
      `SELECT * FROM chat_evento_campana ORDER BY fh_alta DESC`
    );
    connection.release();
    
    res.json(eventos);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

// GET - Obtener eventos de una campaña específica
router.get('/campana/:id_campana', async (req, res) => {
  try {
    const { id_campana } = req.params;
    const connection = await pool.getConnection();
    const [eventos] = await connection.query(
      `SELECT * FROM chat_evento_campana WHERE id_campana = ? ORDER BY fh_alta DESC`,
      [id_campana]
    );
    connection.release();
    
    res.json(eventos);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

// GET - Obtener un evento específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [evento] = await connection.query(
      `SELECT * FROM chat_evento_campana WHERE id = ?`,
      [id]
    );
    connection.release();
    
    if (evento.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    res.json(evento[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener evento' });
  }
});

// POST - Crear nuevo evento de campaña
router.post('/', async (req, res) => {
  try {
    const {
      id_campana,
      ejecucion_mensual,
      dia_mensual,
      ejecuion_diaria,
      dia_lunes,
      dia_martes,
      dia_miercoles,
      dia_jueves,
      dia_viernes,
      dia_sabado,
      dia_domingo,
      estatus
    } = req.body;
    
    if (!id_campana) {
      return res.status(400).json({ error: 'El ID de campaña es requerido' });
    }
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO chat_evento_campana 
       (id_campana, ejecucion_mensual, dia_mensual, ejecuion_diaria, 
        dia_lunes, dia_martes, dia_miercoles, dia_jueves, dia_viernes, dia_sabado, dia_domingo, estatus, fh_alta, fh_ultimo_envio) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id_campana,
        ejecucion_mensual || 0,
        dia_mensual || 0,
        ejecuion_diaria || 0,
        dia_lunes || 0,
        dia_martes || 0,
        dia_miercoles || 0,
        dia_jueves || 0,
        dia_viernes || 0,
        dia_sabado || 0,
        dia_domingo || 0,
        estatus || 'ALTA'
      ]
    );
    connection.release();
    
    res.json({ 
      id: result.insertId,
      id_campana,
      ejecucion_mensual: ejecucion_mensual || 0,
      dia_mensual: dia_mensual || 0,
      ejecuion_diaria: ejecuion_diaria || 0,
      dia_lunes: dia_lunes || 0,
      dia_martes: dia_martes || 0,
      dia_miercoles: dia_miercoles || 0,
      dia_jueves: dia_jueves || 0,
      dia_viernes: dia_viernes || 0,
      dia_sabado: dia_sabado || 0,
      dia_domingo: dia_domingo || 0,
      estatus: estatus || 'ALTA',
      fh_alta: new Date().toISOString(),
      fh_ultimo_envio: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

// PUT - Actualizar evento de campaña
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      ejecucion_mensual,
      dia_mensual,
      ejecuion_diaria,
      dia_lunes,
      dia_martes,
      dia_miercoles,
      dia_jueves,
      dia_viernes,
      dia_sabado,
      dia_domingo,
      estatus
    } = req.body;
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `UPDATE chat_evento_campana 
       SET ejecucion_mensual = ?, dia_mensual = ?, ejecuion_diaria = ?, 
           dia_lunes = ?, dia_martes = ?, dia_miercoles = ?, dia_jueves = ?, 
           dia_viernes = ?, dia_sabado = ?, dia_domingo = ?, estatus = ?, fh_ultimo_envio = NOW()
       WHERE id = ?`,
      [
        ejecucion_mensual || 0,
        dia_mensual || 0,
        ejecuion_diaria || 0,
        dia_lunes || 0,
        dia_martes || 0,
        dia_miercoles || 0,
        dia_jueves || 0,
        dia_viernes || 0,
        dia_sabado || 0,
        dia_domingo || 0,
        estatus || 'ALTA',
        id
      ]
    );
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    res.json({ 
      id,
      ejecucion_mensual: ejecucion_mensual || 0,
      dia_mensual: dia_mensual || 0,
      ejecuion_diaria: ejecuion_diaria || 0,
      dia_lunes: dia_lunes || 0,
      dia_martes: dia_martes || 0,
      dia_miercoles: dia_miercoles || 0,
      dia_jueves: dia_jueves || 0,
      dia_viernes: dia_viernes || 0,
      dia_sabado: dia_sabado || 0,
      dia_domingo: dia_domingo || 0,
      estatus: estatus || 'ALTA'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
});

// DELETE - Eliminar evento de campaña
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `DELETE FROM chat_evento_campana WHERE id = ?`,
      [id]
    );
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    res.json({ mensaje: 'Evento eliminado correctamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
});

module.exports = router;
