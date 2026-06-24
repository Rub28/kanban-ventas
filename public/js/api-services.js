/**
 * API Services - Archivo centralizado de llamadas al backend
 * Organiza todas las llamadas fetch por módulo/servicio
 */

const API_BASE_URL = 'http://localhost:4004'; // desarrollo
// const API_BASE_URL = 'https://srv743626.hstgr.cloud:443'; // producción

// ============================
// SERVICIO DE ÓRDENES
// ============================

const OrdenesService = {
  /**
   * Obtener todas las órdenes con filtros
   * @param {Object} filtros - Filtros a aplicar (estatus, etc)
   * @returns {Promise<Array>}
   */
  async obtenerTodas(filtros = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/campanas/todosagente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filtros)
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en OrdenesService.obtenerTodas:', error);
      throw error;
    }
  },

  /**
   * Crear nueva orden
   * @param {Object} datos - Datos de la orden
   * @returns {Promise<Object>}
   */
  async crear(datos) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en OrdenesService.crear:', error);
      throw error;
    }
  },

  /**
   * Actualizar estado de orden
   * @param {number} id - ID de la orden
   * @param {string} estatus - Nuevo estado
   * @param {number} usuarioId - ID del usuario que actualiza
   * @returns {Promise<Object>}
   */
  async actualizarEstado(id, estatus, usuarioId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordenes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          estatus: estatus,
          id_usuario_actualiza: usuarioId
        })
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en OrdenesService.actualizarEstado:', error);
      throw error;
    }
  },

  /**
   * Generar folio para nueva orden
   * @param {Object} datos - Datos para generar folio
   * @returns {Promise<Object>}
   */
  async generarFolio(datos) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordenes/generaFolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en OrdenesService.generarFolio:', error);
      throw error;
    }
  },

  /**
   * Descartar/Cancelar orden
   * @param {number} id - ID de la orden
   * @param {string} estatus - Estado (Descartado, Cancelado)
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Object>}
   */
  async descartar(id, estatus, usuarioId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordenes`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id, 
          estatus: estatus,
          id_usuario_actualiza: usuarioId
        })
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en OrdenesService.descartar:', error);
      throw error;
    }
  }
};

// ============================
// SERVICIO DE EVENTOS
// ============================

const EventosService = {
  /**
   * Obtener eventos de una orden
   * @param {number} solicitudId - ID de la solicitud/orden
   * @returns {Promise<Array>}
   */
  async obtenerPorOrden(solicitudId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/eventos?solicitud_id=${solicitudId}`);

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en EventosService.obtenerPorOrden:', error);
      throw error;
    }
  },

  /**
   * Crear nuevo evento
   * @param {Object} datos - Datos del evento
   * @returns {Promise<Object>}
   */
  async crear(datos) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en EventosService.crear:', error);
      throw error;
    }
  },

  /**
   * Registrar cambio de estado
   * @param {Object} datosEvento - Datos del evento de cambio
   * @returns {Promise<Object>}
   */
  async registrarCambioEstado(datosEvento) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEvento)
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en EventosService.registrarCambioEstado:', error);
      throw error;
    }
  },

  /**
   * Agregar comentario a una orden
   * @param {number} idOrden - ID de la orden
   * @param {string} comentario - Texto del comentario
   * @param {boolean} notificarCliente - Si se notifica al cliente
   * @param {Object} datoAdicional - Datos adicionales
   * @returns {Promise<Object>}
   */
  async agregarComentario(idOrden, comentario, notificarCliente = false, datoAdicional = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 0,
          id_orden: idOrden,
          notifico_acliente: notificarCliente,
          nota: `Comentario: ${comentario}`,
          nota_extra: datoAdicional
        })
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en EventosService.agregarComentario:', error);
      throw error;
    }
  }
};

// ============================
// SERVICIO DE WHATSAPP
// ============================

const WhatsAppService = {
  /**
   * Enviar mensaje por WhatsApp
   * @param {string} numero - Número de teléfono
   * @param {string} mensaje - Texto del mensaje
   * @returns {Promise<Object>}
   */
  async enviarMensaje(numero, mensaje) {
    try {
      const urlServerWhatsapp = 'https://n8n-evolution-api.j5x6n9.easypanel.host';
      const apiKey = '5AA53A154FF7-4A8E-9AA6-4AB3D87AA094';

      const response = await fetch(`${urlServerWhatsapp}/message/sendText/Notificaciones - Rubai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify({
          number: numero,
          text: mensaje
        })
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en WhatsAppService.enviarMensaje:', error);
      throw error;
    }
  },

  /**
   * Notificar cliente sobre cambio en su orden
   * @param {string} numeroCliente - Número del cliente
   * @param {string} nombreCliente - Nombre del cliente
   * @param {string} nuevoEstado - Nuevo estado
   * @returns {Promise<Object>}
   */
  async notificarCambioEstado(numeroCliente, nombreCliente, nuevoEstado) {
    const mensaje = `Hola ${nombreCliente}, tu orden ha sido actualizada al estado: *${nuevoEstado}*. Estamos trabajando en ello.`;
    return this.enviarMensaje(numeroCliente, mensaje);
  },

  /**
   * Notificar comentario al cliente
   * @param {string} numeroCliente - Número del cliente
   * @param {string} nombreCliente - Nombre del cliente
   * @param {string} comentario - Comentario a enviar
   * @returns {Promise<Object>}
   */
  async notificarComentario(numeroCliente, nombreCliente, comentario) {
    const mensaje = `Hola ${nombreCliente}, tenemos un comentario para ti:\n\n${comentario}`;
    return this.enviarMensaje(numeroCliente, mensaje);
  }
};

// ============================
// SERVICIO DE CAMPAÑAS
// ============================

const CampanasService = {
  /**
   * Obtener todas las campañas
   * @returns {Promise<Array>}
   */
  async obtenerTodas(dataCampanas) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/campanas/todosAgente`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }, 
        body: JSON.stringify(dataCampanas) 
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();
      console.log(' --> Campañas obtenidas de la API:', data);
      return data;
    } catch (error) {
      console.error('Error en CampanasService.obtenerTodas:', error);
      throw error;
    }
  },

  /**
   * Crear nueva campaña
   * @param {Object} datos - Datos de la campaña
   * @returns {Promise<Object>}
   */
  async crear(datos) {
    try {

     console.log('Datos enviados a API desde Crear ', datos); // Log para verificar datos  
      const response = await fetch(`${API_BASE_URL}/api/campanas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en CampanasService.crear:', error);
      throw error;
    }
  },

  /**
   * Actualizar campaña
   * @param {number} id - ID de la campaña
   * @param {Object} datos - Datos a actualizar
   * @returns {Promise<Object>}
   */
  async actualizar(id, datos) {
    try { 

      console.log('Datos enviados a API desde Actualizar ', datos); // Log para verificar datos      
      datos.id = id; // Asegurar que el ID se envía para la actualización  

      const response = await fetch(`${API_BASE_URL}/api/campanas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(datos)
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en CampanasService.actualizar:', error);
      throw error;
    }
  },

  /**
   * Eliminar campaña
   * @param {number} id - ID de la campaña
   * @returns {Promise<Object>}
   */
  async eliminar(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/campanas/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en CampanasService.eliminar:', error);
      throw error;
    }
  }
};

// ============================
// SERVICIO DE EVENTOS DE CAMPAÑA
// ============================

const EventoCampanaService = {
  /**
   * Obtener eventos de una campaña
   * @param {number} idCampana - ID de la campaña
   * @returns {Promise<Array>}
   */
  async obtenerPorCampana(idCampana) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/eventocampana/${idCampana}`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en EventoCampanaService.obtenerPorCampana:', error);
      throw error;
    }
  },

  /**
   * Crear evento de campaña
   * @param {Object} datos - Datos del evento
   * @returns {Promise<Object>}
   */
  async crear(datos) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/eventocampana`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en EventoCampanaService.crear:', error);
      throw error;
    }
  },

  /**
   * Actualizar evento de campaña
   * @param {number} id - ID del evento
   * @param {Object} datos - Datos a actualizar
   * @returns {Promise<Object>}
   */
  async actualizar(id, datos) {
    try { 
      datos.id = id; // Asegurar que el ID se envía para la actualización
      console.log('Datos enviados a API desde Actualizar EventoCampana ', datos); // Log para verificar datos      

      const response = await fetch(`${API_BASE_URL}/api/eventocampana`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en EventoCampanaService.actualizar:', error);
      throw error;
    }
  },

  /**
   * Eliminar evento de campaña
   * @param {number} id - ID del evento
   * @returns {Promise<Object>}
   */
  async eliminar(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/eventocampana/eliminar/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' } 

      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en EventoCampanaService.eliminar:', error);
      throw error;
    }
  }
};

// ============================
// SERVICIO DE REPORTES
// ============================

const ReportesService = {
  /**
   * Obtener listado de empresas
   * @returns {Promise<Array>}
   */
  async obtenerEmpresas() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reportes/empresas`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en ReportesService.obtenerEmpresas:', error);
      throw error;
    }
  },

  /**
   * Obtener clientes activos de una empresa con sus campañas configuradas
   * @param {number} idEmpresa - ID de la empresa
   * @returns {Promise<Array>}
   * 
   * Retorna array de clientes con:
   * - email_cliente
   * - push_cliente
   * - phone_number
   * - id_empresa
   * - fh_alta
   * - campana_diario (boolean)
   * - campana_semana (boolean)
   * - campana_mensual (boolean)
   * - envia_campana (boolean)
   * - fh_actualizacion_campana
   */ 

  async obtenerClientesActivos(idEmpresa) { 
    try { 

      console.log('Obteniendo clientes activos para empresa ID:', idEmpresa); // Log para verificar el ID de empresa recibido  

      const response = await fetch(`${API_BASE_URL}/api/reportes/clientesActivos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id_empresa: idEmpresa,  
          roluser : 'ADMIN',   
          estatus : 'A' 
        })
      });
    
      console.log('Respuesta de clientes activos:', response.body); // Log para verificar la respuesta raw del fetch 

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`); 

      console.log('Respuesta de clientes activos:', response); // Log para verificar la respuesta raw del fetch  
    
      return await response.json();

    } catch (error) {
      console.error('Error en ReportesService.obtenerClientesActivos:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de clientes por tipo de campaña
   * @param {number} idEmpresa - ID de la empresa
   * @returns {Promise<Object>}
   */
  async obtenerEstadisticas(idEmpresa) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reportes/estadisticas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id_empresa: idEmpresa 
        })
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en ReportesService.obtenerEstadisticas:', error);
      throw error;
    }
  },

  /**
   * Obtener movimientos de órdenes (Dashboard 2)
   * @param {Object} filtros - Filtros { id_empresa, rango, fecha }
   * @returns {Promise<Array>}
   * 
   * Campos de chat_orden:
   * - pushName
   * - phone_number
   * - mensaje
   * - estatus
   * - id_folio_orden
   * - fh_registro
   * - fh_actualizacion
   * - id_usuario_actualiza
   * - id_usuario_asignado
   * - nota
   * - fh_entrega
   * - prioridad_entrega
   */ 


  async obtenerMovimientos(filtros) {
    try { 

        console.log('Obteniendo movimientos con filtros:', filtros); // Log para verificar los filtros recibidos 
      
      const response = await fetch(`${API_BASE_URL}/api/reportes/movimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filtros)
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en ReportesService.obtenerMovimientos:', error);
      throw error;
    }
  },

  /**
   * Obtener datos de cliente vs entregas (Dashboard 3)
   * @param {Object} filtros - Filtros { id_empresa, rango, fecha }
   * @returns {Promise<Array>}
   * 
   * Campos cruzados de chat_cliente y chat_orden:
   * - id_empresa
   * - pushName
   * - phone_number
   * - mensaje
   * - estatus
   * - id_orden
   */
  async obtenerClientesVsEntregas(filtros) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reportes/entregaClientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filtros)
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en ReportesService.obtenerClientesVsEntregas:', error);
      throw error;
    }
  }
};

// ============================
// SERVICIO DE ADMINISTRACIÓN
// ============================

const AdministracionService = {
  /**
   * Obtener listado de empresas para el dropdown
   * @returns {Promise<Array>}
   */
  async obtenerEmpresas() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/administracion/empresas`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en AdministracionService.obtenerEmpresas:', error);
      throw error;
    }
  },

 async obtenerUsuarios() {
    try { 

      console.log('Obteniendo usuarios para administración'); // Log para verificar que se llama a la función  

      const response = await fetch(`${API_BASE_URL}/api/administracion/usuarios`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en AdministracionService.obtenerEmpresas:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las notificaciones de la tabla chat_msg_notifica
   * @returns {Promise<Array>}
   * 
   * Campos retornados:
   * - id (primary key)
   * - id_empresa
   * - mensaje
   * - fh_creacion (fecha hora de creación)
   */
  async obtenerMsgAutoCarga(idcliente) {
    try { 

      console.log(' -->  Obteniendo mensajes de obtenerMsgAutoCarga'); // Log para verificar que se llama a la función 

      const response = await fetch(`${API_BASE_URL}/api/administracion/${idcliente}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });


      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);  

    const data = await response.json();  // Guardamos el resultado real
    console.log('Respuesta de mensajes:', data.body); // Ahora sí verás el objeto/array 

      // return await response.json(); 
      return data.body;  

    } catch (error) {
      console.error('Error en AdministracionService.obtenerMsgAutoCarga:', error);
      throw error;
    }
  },

  /**
   * Crear nueva notificación (máximo 3 por empresa)
   * @param {Object} datos - { id_empresa, mensaje }
   * @returns {Promise<Object>}
   */
  async crearNotificacion(datos) {  
    try { 

      console.log('Datos enviados a API desde Crear Notificación ', datos); // Log para verificar datos  

      const response = await fetch(`${API_BASE_URL}/api/administracion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });


      console.log ('  valor de retorno crearNotificacion : ', response.json());  

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`); 


      return await response.json();
    } catch (error) {
      console.error('Error en AdministracionService.crearNotificacion:', error);
      throw error;
    }
  },

  /**
   * Actualizar notificación existente
   * @param {number} id - ID de la notificación
   * @param {Object} datos - { id_empresa, mensaje }
   * @returns {Promise<Object>}
   */
  async actualizarNotificacion( datos) {
    try {
      console.log(" ActualizarNotificacion:  ", datos); 

      const response = await fetch(`${API_BASE_URL}/api/administracion/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en AdministracionService.actualizarNotificacion:', error);
      throw error;
    }
  },

  /**
   * Eliminar notificación
   * @param {number} id - ID de la notificación
   * @returns {Promise<Object>}
   */ 
  async eliminarNotificacion(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/administracion/${id}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' } 
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error en AdministracionService.eliminarNotificacion:', error);
      throw error;
    }
  }
};

// ============================
// EXPORTAR SERVICIOS
// ============================

// Para uso en navegador (global)
window.OrdenesService = OrdenesService;
window.EventosService = EventosService;
window.WhatsAppService = WhatsAppService;
window.CampanasService = CampanasService;
window.EventoCampanaService = EventoCampanaService;
window.ReportesService = ReportesService;
window.AdministracionService = AdministracionService;

