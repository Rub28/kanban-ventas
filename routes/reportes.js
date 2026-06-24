const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/reportes/empresas
 * Obtener listado de empresas
 */
router.get('/empresas', async (req, res) => {
  try {
    const query = 'SELECT DISTINCT id_empresa as id, id_empresa as nombre FROM chat_cliente LIMIT 50';
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error al obtener empresas:', err);
        return res.status(500).json({ error: 'Error al obtener empresas' });
      }

      res.json(results);
    });
  } catch (error) {
    console.error('Error en GET /empresas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/reportes/clientes-activos
 * Obtener clientes activos de una empresa con sus campañas configuradas
 * 
 * Body esperado:
 * {
 *   "id_empresa": number
 * }
 * 
 * Retorna:
 * Array de clientes con:
 * - email_cliente
 * - push_cliente
 * - phone_number
 * - id_empresa
 * - fh_alta
 * - campana_diario
 * - campana_semana
 * - campana_mensual
 * - envia_campana
 * - fh_actualizacion_campana
 */
router.post('/clientes-activos', async (req, res) => {
  try {
    const { id_empresa } = req.body;

    if (!id_empresa) {
      return res.status(400).json({ error: 'id_empresa es requerido' });
    }

    const query = `
      SELECT 
        cc.email_cliente,
        cc.push_cliente,
        cc.phone_number,
        cc.id_empresa,
        cc.fh_alta,
        cc.campana_diario,
        cc.campana_semana,
        cc.campana_mensual,
        cc.envia_campana,
        cc.fh_actualizacion_campana
      FROM chat_cliente cc
      WHERE cc.id_empresa = ?
      AND cc.phone_number IS NOT NULL
      AND cc.phone_number != ''
      ORDER BY cc.fh_alta DESC
    `;

    db.query(query, [id_empresa], (err, results) => {
      if (err) {
        console.error('Error al obtener clientes activos:', err);
        return res.status(500).json({ error: 'Error al obtener clientes activos' });
      }

      res.json(results || []);
    });
  } catch (error) {
    console.error('Error en POST /clientes-activos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/reportes/estadisticas
 * Obtener estadísticas de clientes por tipo de campaña
 * 
 * Body esperado:
 * {
 *   "id_empresa": number
 * }
 * 
 * Retorna:
 * {
 *   "total_clientes": number,
 *   "clientes_diario": number,
 *   "clientes_semanal": number,
 *   "clientes_mensual": number,
 *   "clientes_con_campana": number,
 *   "clientes_sin_campana": number,
 *   "tasa_activacion": number
 * }
 */
router.post('/estadisticas', async (req, res) => {
  try {
    const { id_empresa } = req.body;

    if (!id_empresa) {
      return res.status(400).json({ error: 'id_empresa es requerido' });
    }

    const query = `
      SELECT 
        COUNT(*) as total_clientes,
        SUM(CASE WHEN campana_diario = 1 THEN 1 ELSE 0 END) as clientes_diario,
        SUM(CASE WHEN campana_semana = 1 THEN 1 ELSE 0 END) as clientes_semanal,
        SUM(CASE WHEN campana_mensual = 1 THEN 1 ELSE 0 END) as clientes_mensual,
        SUM(CASE WHEN (campana_diario = 1 OR campana_semana = 1 OR campana_mensual = 1) AND envia_campana = 1 THEN 1 ELSE 0 END) as clientes_con_campana,
        SUM(CASE WHEN (campana_diario = 0 AND campana_semana = 0 AND campana_mensual = 0) OR envia_campana = 0 THEN 1 ELSE 0 END) as clientes_sin_campana
      FROM chat_cliente cc
      WHERE cc.id_empresa = ?
      AND cc.phone_number IS NOT NULL
      AND cc.phone_number != ''
    `;

    db.query(query, [id_empresa], (err, results) => {
      if (err) {
        console.error('Error al obtener estadísticas:', err);
        return res.status(500).json({ error: 'Error al obtener estadísticas' });
      }

      if (results && results.length > 0) {
        const stats = results[0];
        // Calcular tasa de activación
        stats.tasa_activacion = stats.total_clientes > 0 
          ? Math.round((stats.clientes_con_campana / stats.total_clientes) * 100) 
          : 0;
        
        res.json(stats);
      } else {
        res.json({
          total_clientes: 0,
          clientes_diario: 0,
          clientes_semanal: 0,
          clientes_mensual: 0,
          clientes_con_campana: 0,
          clientes_sin_campana: 0,
          tasa_activacion: 0
        });
      }
    });
  } catch (error) {
    console.error('Error en POST /estadisticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/reportes/movimientos
 * Obtener movimientos de órdenes (Dashboard 2)
 * 
 * Body esperado:
 * {
 *   "id_empresa": number,
 *   "rango": "diario|semanal|mensual",
 *   "fecha": "YYYY-MM-DD"
 * }
 * 
 * Retorna array de movimientos con campos de chat_orden
 */
router.post('/movimientos', async (req, res) => {
  try {
    const { id_empresa, rango, fecha } = req.body;

    if (!id_empresa) {
      return res.status(400).json({ error: 'id_empresa es requerido' });
    }

    let whereClause = 'WHERE co.id_empresa = ?';
    let params = [id_empresa];

    // Aplicar filtros de fecha según rango
    if (rango && fecha) {
      const fechaObj = new Date(fecha);
      const ano = fechaObj.getFullYear();
      const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
      const dia = String(fechaObj.getDate()).padStart(2, '0');

      if (rango === 'diario') {
        whereClause += ` AND DATE(co.fh_registro) = ?`;
        params.push(`${ano}-${mes}-${dia}`);
      } else if (rango === 'semanal') {
        // Fecha del lunes de esa semana
        const semana = new Date(fechaObj);
        semana.setDate(fechaObj.getDate() - fechaObj.getDay() + 1);
        const lunesFormat = semana.toISOString().split('T')[0];
        
        whereClause += ` AND WEEK(co.fh_registro) = WEEK(?) AND YEAR(co.fh_registro) = YEAR(?)`;
        params.push(lunesFormat, lunesFormat);
      } else if (rango === 'mensual') {
        whereClause += ` AND MONTH(co.fh_registro) = ? AND YEAR(co.fh_registro) = ?`;
        params.push(mes, ano);
      }
    }

    const query = `
      SELECT 
        co.pushName,
        co.phone_number,
        co.mensaje,
        co.estatus,
        co.id_folio_orden,
        co.fh_registro,
        co.fh_actualizacion,
        co.id_usuario_actualiza,
        co.id_usuario_asignado,
        co.nota,
        co.fh_entrega,
        co.prioridad_entrega,
        co.id_empresa
      FROM chat_orden co
      ${whereClause}
      ORDER BY co.fh_registro DESC
      LIMIT 1000
    `;

    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error al obtener movimientos:', err);
        return res.status(500).json({ error: 'Error al obtener movimientos' });
      }

      res.json(results || []);
    });
  } catch (error) {
    console.error('Error en POST /movimientos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/reportes/clientes-vs-entregas
 * Obtener datos de cliente vs entregas (Dashboard 3)
 * 
 * Body esperado:
 * {
 *   "id_empresa": number,
 *   "rango": "diario|semanal|mensual",
 *   "fecha": "YYYY-MM-DD"
 * }
 * 
 * Retorna array con datos cruzados de cliente y orden
 */
router.post('/clientes-vs-entregas', async (req, res) => {
  try {
    const { id_empresa, rango, fecha } = req.body;

    if (!id_empresa) {
      return res.status(400).json({ error: 'id_empresa es requerido' });
    }

    let whereClause = 'WHERE cc.id_empresa = ?';
    let params = [id_empresa];

    // Aplicar filtros de fecha según rango
    if (rango && fecha) {
      const fechaObj = new Date(fecha);
      const ano = fechaObj.getFullYear();
      const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
      const dia = String(fechaObj.getDate()).padStart(2, '0');

      if (rango === 'diario') {
        whereClause += ` AND DATE(co.fh_registro) = ?`;
        params.push(`${ano}-${mes}-${dia}`);
      } else if (rango === 'semanal') {
        const semana = new Date(fechaObj);
        semana.setDate(fechaObj.getDate() - fechaObj.getDay() + 1);
        const lunesFormat = semana.toISOString().split('T')[0];
        
        whereClause += ` AND WEEK(co.fh_registro) = WEEK(?) AND YEAR(co.fh_registro) = YEAR(?)`;
        params.push(lunesFormat, lunesFormat);
      } else if (rango === 'mensual') {
        whereClause += ` AND MONTH(co.fh_registro) = ? AND YEAR(co.fh_registro) = ?`;
        params.push(mes, ano);
      }
    }

    const query = `
      SELECT 
        cc.id_empresa,
        cc.pushName,
        cc.phone_number,
        co.mensaje,
        co.estatus,
        co.id_folio_orden as id_orden
      FROM chat_cliente cc
      LEFT JOIN chat_orden co ON cc.phone_number = co.phone_number AND cc.id_empresa = co.id_empresa
      ${whereClause}
      AND cc.phone_number IS NOT NULL
      AND cc.phone_number != ''
      ORDER BY cc.phone_number, co.fh_registro DESC
      LIMIT 1000
    `;

    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error al obtener clientes vs entregas:', err);
        return res.status(500).json({ error: 'Error al obtener datos' });
      }

      res.json(results || []);
    });
  } catch (error) {
    console.error('Error en POST /clientes-vs-entregas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
