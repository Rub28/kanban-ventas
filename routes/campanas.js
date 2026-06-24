const express = require('express');
const router = express.Router();
const pool = require('../config/database'); 

const urlbase = process.env.URL_BASE || 'http://localhost:4004'; // desarrollo
// const urlbase = 'https://srv743626.hstgr.cloud:443';  //  produccion

/*  
async function cargarCampanasDelBackend() {
  try {
   // const response = await fetch('/api/mensajes');    
//    const mensajes = await response.json();

    const postData = {
        estatus : 'Activo',
        id_empresa : 1      //  falta tomar este dato de forma dinámica según el usuario logueado, por ahora se deja fijo para pruebas
    };
 
       const response = await fetch(`${urlbase}/api/campanas/todosagente`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });


        const respuesta = await response.json();
        console.log('Respuesta API:', respuesta);
        
        // Extraer array de mensajes de la respuesta
        const mensajes = Array.isArray(respuesta) ? respuesta : (respuesta.body || []);
        
        if (!Array.isArray(mensajes)) {
          console.warn('Respuesta no es un array:', respuesta);
          throw new Error('Formato de respuesta inválido');
        }
    
    // Limpiar columnas
    document.querySelectorAll('.cards-container').forEach(container => {
      container.innerHTML = '';
    });

    // Agrupar mensajes por estado
    const mensajesPorEstado = {
      'Recepción': [],
      'Orden': [],
      'En empaquetado': [],
      'Lista para Entrega': [],
      'En ruta': [],
      'Entregado': [],
      'Cancelado': []
    };

    allCards = mensajes;

    // Crear tarjetas y agrupar
    mensajes.forEach(mensaje => {
      const estadoMapeado = mapearEstatus(mensaje.estado || mensaje.estatus);
      const card = crearTarjeta(mensaje);
      
      if (mensajesPorEstado[estadoMapeado]) {
        mensajesPorEstado[estadoMapeado].push(card);
      }
    });

    // Agregar tarjetas a columnas
    Object.keys(mensajesPorEstado).forEach(estado => {
      const container = document.getElementById(`column-${formatoId(estado)}`);
      const count = document.getElementById(`count-${formatoId(estado)}`);
      
      // Verificar que los elementos existan antes de modificarlos
      if (!container || !count) {
        console.warn(`Elementos no encontrados para estado: ${estado}`);
        return;
      }
      
      if (mensajesPorEstado[estado].length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>Sin mensajes</p></div>';
      } else {
        container.innerHTML = '';
        mensajesPorEstado[estado].forEach(card => {
          container.appendChild(card);
        });
      }
      
      count.textContent = mensajesPorEstado[estado].length;
    });

    configurarDragAndDrop();
  } catch (error) {
    console.error('Error cargando mensajes:', error);
  }
}
*/

// GET - Obtener todas las campañas
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [campanas] = await connection.query(
      `SELECT * FROM chat_campana ORDER BY fh_alta DESC`
    );
    connection.release();
    
    res.json(campanas);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener campañas' });
  }
});

// GET - Obtener una campaña específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [campana] = await connection.query(
      `SELECT * FROM chat_campana WHERE id = ?`,
      [id]
    );
    connection.release();
    
    if (campana.length === 0) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }
    
    res.json(campana[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener campaña' });
  }
});

// POST - Crear nueva campaña
router.post('/', async (req, res) => {
  try {
    const { id_empresa, texto_informa, id_emagen, estatus } = req.body;
    
    if (!texto_informa) {
      return res.status(400).json({ error: 'El texto de información es requerido' });
    }
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO chat_campana (id_empresa, texto_informa, id_emagen, estatus, fh_alta) 
       VALUES (?, ?, ?, ?, NOW())`,
      [id_empresa || 1, texto_informa, id_emagen || 'ALTA', estatus || 'ALTA']
    );
    connection.release();
    
    res.json({ 
      id: result.insertId, 
      id_empresa: id_empresa || 1, 
      texto_informa, 
      id_emagen: id_emagen || 'ALTA', 
      estatus: estatus || 'ALTA',
      fh_alta: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al crear campaña' });
  }
});

// PUT - Actualizar campaña
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { texto_informa, id_emagen, estatus } = req.body;
    
    if (!texto_informa) {
      return res.status(400).json({ error: 'El texto de información es requerido' });
    }
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `UPDATE chat_campana SET texto_informa = ?, id_emagen = ?, estatus = ? WHERE id = ?`,
      [texto_informa, id_emagen || 'ALTA', estatus || 'ALTA', id]
    );
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }
    
    res.json({ id, texto_informa, id_emagen: id_emagen || 'ALTA', estatus: estatus || 'ALTA' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al actualizar campaña' });
  }
});

// DELETE - Eliminar campaña
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    // Primero eliminar eventos asociados
    await connection.query(`DELETE FROM chat_evento_campana WHERE id_campana = ?`, [id]);
    
    // Luego eliminar la campaña
    const [result] = await connection.query(
      `DELETE FROM chat_campana WHERE id = ?`,
      [id]
    );
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }
    
    res.json({ mensaje: 'Campaña eliminada correctamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al eliminar campaña' });
  }
});

module.exports = router;
