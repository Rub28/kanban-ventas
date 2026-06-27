// Variables globales
// let currentUser = null;
let allCards = [];
let draggedCard = null;
let selectedCard = null;
let modalZIndex = 1000; // Para controlar el orden de modales superpuestos
let vistaSimplificada = false; // Control de vista simplificada

 // const urlbase = 'http://localhost:4005'; // desarrollo    
 const urlbase = 'https://srv743626.hstgr.cloud:4005';  //  produccion  
 
  const storedUser = localStorage.getItem('currentUser');
  const usuariosArray = JSON.parse(storedUser);

  // Como es un array con un solo elemento (el usuario)
  const sesionUser = usuariosArray[0];

  // Ahora puedes usar sus propiedades 
  /* 
  console.log(sesionUser.id);            // 1
  console.log(sesionUser.nombre);        // "Ernesto "
  console.log(sesionUser.tipo_user);     // "DOCTOR"
  console.log(sesionUser.estatus);       // "A"
 */ 


// Función helper para abrir modales con z-index dinámico
function abrirModalConZIndex(modalId) {
  modalZIndex += 1;
  const modal = document.getElementById(modalId);
  modal.style.zIndex = modalZIndex;
  modal.classList.add('show');
}

// Función helper para cerrar modales
function cerrarModalConZIndex(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('show');
  modal.style.zIndex = 1000; // Reset a valor por defecto
}

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => { 

  console.log (" Carga inicial de la APP  ");  

  // inicializarApp(); 
  
  cargarMensajes();
  configurarDragAndDrop();
  setInterval(cargarMensajes, 30000); // Actualizar cada 30 segundos
});


/**
 * Alternar entre vista normal y vista simplificada de tarjetas
 */
function alternarVistaSimplificada() {
  const checkbox = document.getElementById('viewMode');
  vistaSimplificada = checkbox.checked;
  
  // Obtener todas las tarjetas
  const tarjetas = document.querySelectorAll('.kanban-card');
  
  if (vistaSimplificada) {
    // Activar vista simplificada
    tarjetas.forEach(tarjeta => {
      tarjeta.classList.add('simplified');
    });
    console.log('Vista simplificada activada');
  } else {
    // Regresar a vista normal
    tarjetas.forEach(tarjeta => {
      tarjeta.classList.remove('simplified');
    });
    console.log('Vista normal activada');
  }
}

// Cargar mensajes de la BD
async function cargarMensajes() {
  try { 

   // Leer y parsear
    const storedUser = localStorage.getItem('currentUser');
    const usuariosArray = JSON.parse(storedUser);

    // Como es un array con un solo elemento (el usuario)
    const sesionUser = usuariosArray[0];

    const postData = {   
        id_empresa : sesionUser.id, 
        estatus : 'Descartado'    
    };
 
       const response = await fetch(`${urlbase}/api/ordenes/todosagente`, {
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
          // Aplicar clase simplified si está activada la vista simplificada
          if (vistaSimplificada) {
            card.classList.add('simplified');
          }
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

// Crear elemento de tarjeta
function crearTarjeta(mensaje) {
  const card = document.createElement('div');
  card.className = 'kanban-card';
  card.draggable = true;
  card.dataset.id = mensaje.id || mensaje.idMensaje || mensaje.id_mensaje || Math.random();
  
  // Mapear el estatus de la API al estado esperado
  const estadoMapeado = mapearEstatus(mensaje.estado || mensaje.estatus);
  card.dataset.status = estadoMapeado;

  // Manejar diferentes formatos de fecha
  let fecha = 'N/A';
  let hora = 'N/A';
  let fechaFormateada = 'N/A';
  
  const fechaOriginal = mensaje.fh_registro; //  || mensaje.fecha_hora || mensaje.createdAt || mensaje.created_at; 

  if (fechaOriginal) {
    try {
      const fechaObj = new Date(fechaOriginal);
       fechaFormateada = fechaObj.toISOString().slice(0, 19).replace('T', ' ');  

        //  fecha = fechaObj.toLocaleDateString('es-ES');        
        // hora = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.warn('Error parsando fecha:', fechaOriginal);
    }
  } 


  // Manejar diferentes nombres de campos
  const nombre = mensaje.pushName || mensaje.nombre || mensaje.remitente || 'Sin nombre';
  const telefono = mensaje.phone_number || mensaje.telefono || mensaje.phoneNumber || 'N/A';
  const textoMensaje = mensaje.mensaje || mensaje.message || mensaje.texto || 'Sin mensaje';


  card.innerHTML = `
    <div class="card-header">
      <div class="card-name">${nombre}</div>
      <span class="card-folio"># ${mensaje.id || mensaje.folio_orden || 'N/A'}</span>
      <span class="card-badge"># ${mensaje.id || mensaje.id_mensaje || 'N/A'}</span>
    </div>
    <div class="card-phone">
      <i class="fas fa-phone"></i> ${telefono}
    </div>
    <div class="card-message">${textoMensaje}</div>
    <div class="card-footer">
      <span class="card-date">${fechaFormateada} </span>
      <div class="card-actions">
        <button class="btn-icon" title="Ver detalles" onclick="abrirDetalles(event, ${mensaje.id_mensaje || mensaje.id || mensaje.idMensaje})">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn-icon" title="Historial" onclick="verHistorial(event, ${mensaje.id_mensaje || mensaje.id || mensaje.idMensaje})">
          <i class="fas fa-history"></i>
        </button>
        <button class="btn-icon btn-cancel" title="Cancelar" onclick="descartarMensaje(event, ${mensaje.id_empresa || mensaje.id_mensaje})">
          <i class="fas fa-times-circle"></i>
        </button>
      </div>
    </div>
  `;

  card.addEventListener('dragstart', handleDragStart);
  card.addEventListener('dragend', handleDragEnd);
  card.addEventListener('click', (e) => {
    if (!e.target.closest('.btn-icon')) {
      abrirDetalles(e, mensaje.id_mensaje || mensaje.id || mensaje.idMensaje);
    }
  });

  return card;
}

// Mapeo de estatus de API a estados de la aplicación
function mapearEstatus(estatusAPI) {
  const mapeo = {
    'inicio': 'Recepción',
    'recepcion': 'Recepción',
    'orden': 'Orden',
    'empaquetado': 'En empaquetado',
    'en empaquetado': 'En empaquetado',
    'lista para entrega': 'Lista para Entrega',
    'en ruta': 'En ruta',
    'entregado': 'Entregado',
    'cancelado': 'Cancelado'
  };
  
  const clave = (estatusAPI || '').toLowerCase().trim();
  return mapeo[clave] || 'Recepción'; // Por defecto Recepción
}

// Convertir estado a ID seguro - mapeo directo con IDs en HTML
function formatoId(estado) {
  const mapeoEstados = {
    'Recepción': 'recepcion',
    'Orden': 'orden',
    'En empaquetado': 'empaquetado',
    'Lista para Entrega': 'lista-entrega',
    'En ruta': 'en-ruta',
    'Entregado': 'entregado',
    'Cancelado': 'cancelado'
  };
  
  return mapeoEstados[estado] || estado
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace('á', 'a')
    .replace('é', 'e')
    .replace('í', 'i')
    .replace('ó', 'o')
    .replace('ú', 'u')
    .replace('ñ', 'n');
}

// Configurar Drag and Drop
function configurarDragAndDrop() {
  const containers = document.querySelectorAll('.cards-container');

  containers.forEach(container => {
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);
    container.addEventListener('dragleave', handleDragLeave);
  });
}

// Manejar inicio del arrastre
function handleDragStart(e) {
  draggedCard = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

// Manejar fin del arrastre
function handleDragEnd(e) {
  draggedCard = null;
  this.classList.remove('dragging');
  document.querySelectorAll('.cards-container').forEach(c => {
    c.classList.remove('drag-over');
  });
}

// Manejar dragover
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  this.classList.add('drag-over');
  return false;
}

// Manejar dragleave
function handleDragLeave(e) {
  if (e.target === this) {
    this.classList.remove('drag-over');
  }
}

// Manejar drop
async function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  this.classList.remove('drag-over');

  if (draggedCard) {
    const nuevoEstado = this.closest('.kanban-column').dataset.status;
    const cardId = draggedCard.dataset.id;
    const estadoAnterior = draggedCard.dataset.status;

    console.log(`Intentando mover tarjeta ID ${cardId} de ${estadoAnterior} a ${nuevoEstado}`);     

    // Guardar los datos ANTES de que draggedCard se limpie
    const cardData = {
      element: draggedCard,
      id: cardId,
      nombre: draggedCard.querySelector('.card-name')?.textContent.trim() || 'N/A',
      telefono: draggedCard.querySelector('.card-phone')?.textContent.trim() || 'N/A',
      mensaje: draggedCard.querySelector('.card-message')?.textContent.trim() || 'N/A',
      estadoAnterior: estadoAnterior,
      nuevoEstado: nuevoEstado
    };

    const dataFolio  = {  
      id_orden : cardId,  
      prefijo_folio : 'ALTA',   
      pushName : cardData.nombre, 
      phone_number : cardData.telefono, 
      id_empresa : cardData.id_empresa  || 1 // falta ubicar donde se guarda la empresa 
    }; 

    const dataOrden  = { 
      id : estadoAnterior === 'inicio' ? 0 : cardId,
      pushName : cardData.nombre, 
      phone_number : cardData.telefono, 
      mensaje : cardData.mensaje,  
      estatus : nuevoEstado, 
      id_usuario_actualiza : sesionUser.id || 1 
    };

    if (nuevoEstado !== estadoAnterior) {
      try {  

          if ((estadoAnterior === 'Recepción' && nuevoEstado === 'Orden') ||  (estadoAnterior === 'Inicio' && nuevoEstado === 'Orden'))  {  
            console.log('Generando folio para nueva orden con los siguientes datos:', dataFolio);  

            await generarFolio(dataFolio, nuevoEstado, estadoAnterior);
          }  

        await actualizarEstadoSolicitud(dataOrden, nuevoEstado, estadoAnterior);
        cardData.element.dataset.status = nuevoEstado;
        this.appendChild(cardData.element);
        
        // Actualizar contadores
        actualizarContadores();
        
        // Mostrar notificación
        mostrarNotificacion('Solicitud movida correctamente', 'success');
      } catch (error) {
        console.error('Error al mover solicitud:', error);
        mostrarNotificacion('Error al mover la solicitud', 'error');
      }
    }
  }

  return false;
}

// Actualizar estado de solicitud
async function actualizarEstadoSolicitud(dataOrden, nuevoEstado, estadoAnterior) { 

  // const response = await fetch(`/api/solicitudes/${solicitudId}`, {     
  console.log('Llego hasta la funcion actualizarEstadoSolicitud con los siguientes datos:');    

  console.log('Actualizando solicitud:', { dataOrden, nuevoEstado, estadoAnterior }); 

  const response = await fetch(`${urlbase}/api/ordenes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },  
    body: JSON.stringify(dataOrden) 

    /*
    body: JSON.stringify({ 
      id : solicitudId, 
      id_mensaje : solicitudId, 
      pushName : currentUser.nombre, 
      phone_number : 'N/A', 
      mensaje : `Cambio de estado a ${nuevoEstado}`, 
      estatus : nuevoEstado,  
      id_usuario_actualiza : currentUser.id || 1   
    }) 
    */ 
  });

  if (!response.ok) {
    throw new Error('Error al actualizar');
  }

  return response.json();
}


// Genera Folio 
async function generarFolio(dataFolio, nuevoEstado, estadoAnterior) { 

  // const response = await fetch(`/api/solicitudes/${solicitudId}`, {     
  console.log('Llego hasta la funcion actualizarEstadoSolicitud con los siguientes datos:');    

  console.log('Actualizando solicitud:', { dataFolio, nuevoEstado, estadoAnterior }); 

  const response = await fetch(`${urlbase}/api/ordenes/generaFolio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },  
    body: JSON.stringify(dataFolio) 

    /*
    body: JSON.stringify({ 
      id : solicitudId, 
      id_mensaje : solicitudId, 
      pushName : currentUser.nombre, 
      phone_number : 'N/A', 
      mensaje : `Cambio de estado a ${nuevoEstado}`, 
      estatus : nuevoEstado,  
      id_usuario_actualiza : currentUser.id || 1   
    }) 
    */ 
  });

  if (!response.ok) {
    throw new Error('Error al actualizar');
  }

  return response.json();
}


//  Esta solo sirve los mensajes no tienen solicitudes de Ordenes o Pedidos, solcitud real. 
async function descartaMensaje (solicitudId, nuevoEstado, estadoAnterior) { 

  // const response = await fetch(`/api/solicitudes/${solicitudId}`, {     
  console.log('Llego hasta la funcion actualizarEstadoSolicitud con los siguientes datos:');    

  console.log('Actualizando solicitud:', {
    solicitudId,
    nuevoEstado,  
    estadoAnterior,
    usuarioId: sesionUser.id,
    nombreUsuario: sesionUser.nombre,
    rolUsuario: sesionUser.rol
  });  

  const response = await fetch(`${urlbase}/api/ordenes`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      id : solicitudId,
      estatus : nuevoEstado,
      id_usario_actualiza : sesionUser.id   

    // estadoAnterior: estadoAnterior,
    //nombreUsuario: sesionUser.nombre,
      // id_usario_actualiza : sesionUser.rol 
     //  comentario: `Cambio de ${estadoAnterior} a ${nuevoEstado}` 

    })
  });

  if (!response.ok) {
    throw new Error('Error al actualizar');
  }

  return response.json();
}


// Actualizar contadores
function actualizarContadores() {
  const estados = ['Recepción', 'Orden', 'En empaquetado', 'Lista para Entrega', 'En ruta', 'Entregado', 'Cancelado'];
  
  estados.forEach(estado => {
    const id = formatoId(estado);
    const container = document.getElementById(`column-${id}`);
    const count = document.getElementById(`count-${id}`);
    const cards = container.querySelectorAll('.kanban-card');
    count.textContent = cards.length;
  });
}

// Abrir detalles de tarjeta
function abrirDetalles(event, cardId) {
  event.preventDefault();
  event.stopPropagation();
  
  console.log('abrirDetalles llamado con cardId:', cardId, 'tipo:', typeof cardId);
  console.log('allCards disponibles:', allCards);
  
  // Búsqueda flexible - probar múltiples propiedades como en cancelarTarjeta
  const card = allCards.find(c => {
    return String(c.id_mensaje) === String(cardId) ||
           String(c.id) === String(cardId) ||
           String(c.idMensaje) === String(cardId) ||
           String(c.id_empresa) === String(cardId) ||
           String(c.mensaje_id) === String(cardId);
  });
  
  if (!card) {
    console.warn('Tarjeta no encontrada con ID:', cardId);
    console.warn('allCards disponibles:', allCards);
    mostrarNotificacion('Error: Tarjeta no encontrada', 'error');
    return;
  }

  console.log('Tarjeta encontrada:', card);

  // Manejar diferentes nombres de campos
  const nombre = card.pushName || card.nombre || card.remitente || 'Sin nombre';
  const telefono = card.phone_number || card.telefono || card.phoneNumber || 'N/A';
  const textoMensaje = card.mensaje || card.message || card.texto || 'Sin mensaje';
  const fechaOriginal = card.fh_registro || card.fecha_hora || card.createdAt;
  
  let fechaFormato = 'N/A';
  if (fechaOriginal) {
    try {
      fechaFormato = new Date(fechaOriginal).toLocaleString('es-ES');
    } catch (e) {
      console.warn('Error formateando fecha:', fechaOriginal);
    }
  }

  document.getElementById('modalTitle').textContent = `Detalles - ${nombre}   -    ${card.folio_orden.substring(7) || 'N/A'}`;
  document.getElementById('modalFrom').textContent = nombre;
  document.getElementById('modalPhone').textContent = telefono;
  document.getElementById('modalMessage').textContent = textoMensaje;
  document.getElementById('modalDate').textContent = fechaFormato;
  document.getElementById('modalStatus').textContent = card.estado || card.estatus || 'Recepción';
  
  // Establecer el select con usuario asignado (o vacío por defecto)
  const selectAsignado = document.getElementById('modalAssigned');
  selectAsignado.value = card.asignado_a_id || card.usuario_id_asignado || '';

  selectedCard = card;
  abrirModalConZIndex('cardModal');
}

// Descartar mensaje (Cancelar tarjeta) 
async function descartarMensaje(event, cardId) {
  event.preventDefault();
  event.stopPropagation();
  
  // Usar el elemento del evento para obtener el ID correcto
  const cardElement = event.target.closest('.kanban-card');
  if (!cardElement) {
    mostrarNotificacion('Error: Tarjeta no encontrada', 'error');
    return;
  }
  
  const actualCardId = cardElement.dataset.id; 
  console.log('Intentando cancelar tarjeta con ID:', actualCardId);
  console.log('allCards contiene:', allCards);
  console.log('Buscando en allCards una tarjeta con ID:', actualCardId);

  // Búsqueda más flexible - probar múltiples propiedades
  const card = allCards.find(c => {
    const matches = 
      String(c.id_mensaje) === String(actualCardId) ||
      String(c.id) === String(actualCardId) ||
      String(c.idMensaje) === String(actualCardId) ||
      String(c.id_empresa) === String(actualCardId) ||
      String(c.mensaje_id) === String(actualCardId);
    
    if (matches) {
      console.log('Tarjeta encontrada:', c);
    }
    return matches;
  });

  if (!card) {
    console.warn('Tarjeta no encontrada en base de datos. Propiedades de allCards[0]:', allCards[0]);
    mostrarNotificacion('Error: Tarjeta no encontrada en base de datos', 'error');
    return;
  }

  // Mostrar mensaje de confirmación
  const nombre = card.pushName || card.nombre || card.remitente || 'Sin nombre';
  const confirmar = confirm(`¿Estás seguro de que deseas cancelar la tarjeta de ${nombre}?\n\nEsta acción no se puede deshacer.`);
  
  if (!confirmar) {
    return;
  }

  try {
    const estadoAnterior = cardElement.dataset.status || 'Recepción';
    
    // Actualizar estado en BD
    // await actualizarEstadoSolicitud(actualCardId, 'Cancelado', estadoAnterior); 

    // Esta funcion solo actualiza el estado a Cancelado, no registra el evento de cambio de estado, ni tampoco registra el usuario que hizo el cambio. 
      await descartaMensaje(actualCardId, 'Descartado', estadoAnterior);  
    

    // Mover tarjeta a columna Cancelado
    const columnaCancelada = document.getElementById('column-cancelado');
    cardElement.dataset.status = 'Cancelado';
    columnaCancelada.appendChild(cardElement);
    
    // Actualizar contadores
    actualizarContadores();
    
    // Mostrar notificación
    mostrarNotificacion(`Tarjeta de ${nombre} cancelada correctamente`, 'success');
  } catch (error) {
    console.error('Error al cancelar tarjeta:', error);
    mostrarNotificacion('Error al cancelar la tarjeta', 'error');
  }
}
async function verHistorial(event, cardId) {
  event.preventDefault();
  event.stopPropagation();
  
  try {
    const response = await fetch(`${urlbase}/api/eventos?solicitud_id=${cardId}`);
    const eventos = await response.json();

    let html = '';
    if (eventos.length === 0) {
      html = '<p style="text-align: center; color: #95a5a6;">Sin historial de cambios</p>';
    } else {
      eventos.forEach(evento => {
        const fecha = new Date(evento.fh_evento).toLocaleString('es-ES');
        html += `
          <div class="history-item">
            <div class="history-date"><i class="fas fa-clock"></i> ${fecha}</div>
            <div class="history-action">
              <strong>${evento.accion}</strong><br>
              De: <strong>${evento.estado_anterior || 'N/A'}</strong> → A: <strong>${evento.estado_nuevo}</strong>
            </div>
            <div class="history-user">
              <i class="fas fa-user"></i> ${evento.usuario_nombre} (${evento.rol})
            </div>
            ${evento.comentario ? `<div style="margin-top: 0.5rem; color: #2c3e50; font-size: 0.85rem;"><i class="fas fa-comment"></i> "${evento.comentario}"</div>` : ''}
          </div>
        `;
      });
    }

    document.getElementById('historyList').innerHTML = html;
    abrirModalConZIndex('historyModal');
  } catch (error) {
    console.error('Error cargando historial:', error);
    mostrarNotificacion('Error al cargar el historial', 'error');
  }
}

// Agregar comentario
async function agregarComentario() { 

  const comentario = document.getElementById('commentBox').value.trim(); 
  const notifyCliente = document.getElementById('notifyCheckbox').checked;   
  const AsignadoA = document.getElementById('modalAssigned').value; 


  if (!comentario) {
    mostrarNotificacion('Por favor ingresa un comentario', 'warning');
    return;
  }

  if (notifyCliente && !selectedCard) {
    mostrarNotificacion('No se puede notificar al cliente sin una tarjeta seleccionada', 'error');
    return;
  } 

  if (notifyCliente) { 
     notificarClienteWhatsapp();
  }  

  if (!selectedCard) return;

  try {
    await fetch(`${urlbase}/api/eventos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 0,  
         
        id_orden :  selectedCard.id_mensaje,  
        notifico_acliente : notifyCliente,  
        nota: `Comentario: ${comentario}`,  
        nota_extra: `Cambia valor asignado: ${AsignadoA}`  
      })
    });

    document.getElementById('commentBox').value = ''; 
    document.getElementById('notifyCheckbox').checked = false; 
    limpiarFormularioModal();

    mostrarNotificacion('Comentario agregado correctamente', 'success');  

  } catch (error) {
    console.error('Error al agregar comentario:', error);
    mostrarNotificacion('Error al agregar comentario', 'error');
  }
}

// la Notificacion al cliente es la whatsapp, se envia un mensaje al cliente notificandole que se ha agregado un comentario a su solicitud, o que se ha cambiado el valor del usuario asignado.  
async function notificarClienteWhatsapp() { 

  const comentario = document.getElementById('commentBox').value.trim(); 
  const notifyCliente = document.getElementById('notifyCheckbox').checked;   
  const AsignadoA = document.getElementById('modalAssigned').value; 
  const telefonoCliente = document.getElementById('modalPhone').textContent.trim(); 

 console.log('Intentando notificar al cliente via WhatsApp con los siguientes datos:');
 console.log(' --> Teléfono del cliente:', telefonoCliente);
 console.log(' --> Comentario:', comentario);  

  if (!comentario) {
    mostrarNotificacion('Por favor ingresa un comentario', 'warning');
    return;
  }

  if (!selectedCard) return;

  console.log('Enviando notificación al cliente via WhatsApp para la tarjeta:', selectedCard); 

 const urlServerWhatsapp = 'https://n8n-evolution-api.j5x6n9.easypanel.host'
// https://n8n-evolution-api.j5x6n9.easypanel.host/message/sendText/Notificaciones - Rubai   

  try {
    await fetch(`${urlServerWhatsapp}/message/sendText/Notificaciones - Rubai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
        'apikey': '5AA53A154FF7-4A8E-9AA6-4AB3D87AA094'

      },
      body: JSON.stringify({
        "number" : telefonoCliente,    //"5215535225611@s.whatsapp.net",   //   "{{remoteJid}}",
        "text" : comentario  
      })
    });

    document.getElementById('commentBox').value = '';
    mostrarNotificacion(' Se notificó al cliente via WhatsApp', 'success') 

  } catch (error) {
    console.error('Error al agregar comentario:', error);
    mostrarNotificacion('Error al agregar comentario', 'error');
  }
}

// Limpiar formulario del modal
function limpiarFormularioModal() {
  // Desseleccionar todos los radio buttons
  document.querySelectorAll('input[name="usuario"]').forEach(radio => {
    radio.checked = false;
  });
  
  // Limpiar el textarea de comentarios
  document.getElementById('commentBox').value = '';
  
  // Desmarcar notificación
  document.getElementById('notifyCheckbox').checked = false;
  
  // Reset el select de asignados
  document.getElementById('modalAssigned').value = '';
}

// Cerrar modal
function cerrarModal() {
  limpiarFormularioModal();
  cerrarModalConZIndex('cardModal');
  selectedCard = null;
}

// Cerrar historial
function cerrarHistorial() {
  cerrarModalConZIndex('historyModal');
}

// Abrir vista en grilla de sección
function abrirVistaGrilla(estado) {
  console.log('Abriendo grilla para estado:', estado);
  
  // Mapear el estado al formato que espera la tabla
  const estadoMapeado = estado;
  
  // Filtrar tarjetas por estado
  const tarjetasDelEstado = allCards.filter(card => {
    const estadoCard = card.estado || card.estatus || 'Recepción';
    const estadoCardMapeado = mapearEstatus(estadoCard);
    return estadoCardMapeado === estadoMapeado;
  });
  
  console.log('Tarjetas encontradas para estado', estadoMapeado, ':', tarjetasDelEstado.length);
  
  // Actualizar título
  document.getElementById('grillaTitle').textContent = `${estadoMapeado} (${tarjetasDelEstado.length} mensajes)`;
  
  // Llenar tabla
  const tbody = document.getElementById('grillaTableBody');
  tbody.innerHTML = '';
  
  tarjetasDelEstado.forEach(card => {
    const folio = card.folio_orden ? `${card.folio_orden.substring(7)}` : `${card.id || card.id_mensaje || 'N/A'}`; 
    const nombre = card.pushName || card.nombre || 'Sin nombre';
    const telefono = card.phone_number || card.telefono || 'N/A';
    const mensaje = (card.mensaje || card.message || 'Sin mensaje').substring(0, 100);
    const fecha = card.fh_registro ? new Date(card.fh_registro).toLocaleString('es-ES') : 'N/A';
    const estado = card.estado || card.estatus || 'Recepción';
    const asignado = card.asignado_a || card.usuario_asignado || '-';
    const idCard = card.id_mensaje || card.id || card.idMensaje || 'N/A';
    
    // Obtener clase de badge según estado
    const estadoKey = formatoId(estado);
    const badgeClass = estadoKey.replace('-', '');
    
    const row = document.createElement('tr');
    
    // Construir botones dinámicamente
    let botonesHTML = `
      <button class="btn-icon-small" title="Ver detalles" onclick="abrirVistaGrilla('${estadoMapeado}'); abrirDetalles(event, ${idCard})">
        <i class="fas fa-eye"></i>
      </button>
      <button class="btn-icon-small" title="Historial" onclick="verHistorial(event, ${idCard})">
        <i class="fas fa-history"></i>
      </button>`;
    
    // Agregar botón de cancelar SOLO para Recepción
    if (estadoMapeado === 'Recepción') {
      botonesHTML += `
      <button class="btn-icon-small btn-danger" title="Cancelar" onclick="descartarMensajeDesdeGrilla(${idCard}, '${nombre.replace(/'/g, "\\'")}')">
        <i class="fas fa-times-circle"></i>
      </button>`;
    }
    
    row.innerHTML = `
      <td>${idCard}</td>
      <td>${folio}</td> 
      <td>${nombre}</td>
      <td>${telefono}</td>
      <td class="cell-text-truncate" title="${card.mensaje || 'Sin mensaje'}">${mensaje}</td>
      <td>${fecha}</td>
      <td><span class="badge-status ${badgeClass}">${estado}</span></td>
      <td>${asignado}</td>
      <td>
        <div class="cell-actions">
          ${botonesHTML}
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  // Mostrar modal
  abrirModalConZIndex('grillaSectionModal');
}

// Cerrar vista en grilla
function cerrarGrilla() {
  cerrarModalConZIndex('grillaSectionModal');
}

// Cancelar mensaje desde grilla (solo para Recepción)
async function descartarMensajeDesdeGrilla(cardId, nombre) {
  console.log('Cancelar desde grilla:', cardId, nombre);
  
  // Pedir confirmación
  const confirmar = confirm(`¿Estás seguro de que deseas cancelar la tarjeta de ${nombre}?\n\nEsta acción no se puede deshacer.`);
  
  if (!confirmar) {
    return;
  }

  try {
    // Buscar la tarjeta en allCards
    const card = allCards.find(c => {
      return String(c.id_mensaje) === String(cardId) ||
             String(c.id) === String(cardId) ||
             String(c.idMensaje) === String(cardId) ||
             String(c.id_empresa) === String(cardId) ||
             String(c.mensaje_id) === String(cardId);
    });

    if (!card) {
      mostrarNotificacion('Error: Tarjeta no encontrada', 'error');
      return;
    }

    const estadoAnterior = card.estado || card.estatus || 'Recepción';
    
    // Llamar a la función de descarte (igual que en tarjetas)
    await descartaMensaje(cardId, 'Descartado', estadoAnterior);
    
    // Actualizar allCards - cambiar estado a Cancelado
    card.estado = 'Cancelado';
    card.estatus = 'Cancelado';
    
    // Actualizar contadores
    actualizarContadores();
    
    // Recargar la grilla de Recepción (refrescar la vista actual)
    abrirVistaGrilla('Recepción');
    
    // Mostrar notificación
    mostrarNotificacion(`Tarjeta de ${nombre} cancelada correctamente`, 'success');
    
  } catch (error) {
    console.error('Error al cancelar tarjeta desde grilla:', error);
    mostrarNotificacion('Error al cancelar la tarjeta', 'error');
  }
}
function cerrarHistorial() {
  document.getElementById('historyModal').classList.remove('show');
}

// Filtrar por fecha
function filtrarPorFecha() {
  const fecha = document.getElementById('filterDate').value;
  if (!fecha) {
    cargarMensajes();
    return;
  }
  
  const cards = document.querySelectorAll('.kanban-card');
  cards.forEach(card => {
    const mensaje = allCards.find(m => m.id == card.dataset.id);
    if (mensaje) {
      const fechaMensaje = new Date(mensaje.fh_registro).toISOString().split('T')[0];
      card.style.display = fechaMensaje === fecha ? 'block' : 'none';
    }
  });
}

// Filtrar por estado
function filtrarPorEstado() {
  const estado = document.getElementById('filterStatus').value;
  const cards = document.querySelectorAll('.kanban-card');
  
  cards.forEach(card => {
    if (!estado) {
      card.style.display = 'block';
    } else {
      card.style.display = card.dataset.status === estado ? 'block' : 'none';
    }
  });
}

// Refrescar tablero
function refrescarTablero() {
  const btn = event.target.closest('.btn-refresh');
  btn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Actualizando...';
  
  cargarMensajes().then(() => {
    btn.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar';
    mostrarNotificacion('Tablero actualizado', 'success');
  });
}

// Abrir reportes
function abrirReportes() {
  window.location.href = '/reportes.html';
}

// Logout
function logout() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    window.location.href = '/login';
  }
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'info') {
  const notif = document.createElement('div');
  notif.className = `notificacion notificacion-${tipo}`;
  notif.innerHTML = `
    <div style="padding: 1rem; background-color: ${getColorNotificacion(tipo)}; color: white; border-radius: 4px; position: fixed; top: 20px; right: 20px; z-index: 2000; min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
      ${mensaje}
    </div>
  `;
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.remove();
  }, 3000);
}

function getColorNotificacion(tipo) {
  const colores = {
    success: '#2ecc71',
    error: '#e74c3c',
    warning: '#f39c12',
    info: '#3498db'
  };
  return colores[tipo] || colores.info;
}

// Cerrar modales al presionar Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    cerrarModal();
    cerrarHistorial();
  }
});

// Cerrar modales al hacer clic fuera
window.addEventListener('click', (e) => {
  const cardModal = document.getElementById('cardModal');
  const historyModal = document.getElementById('historyModal');
  
  if (e.target === cardModal) {
    cerrarModal();
  }
  if (e.target === historyModal) {
    cerrarHistorial();
  }
});
