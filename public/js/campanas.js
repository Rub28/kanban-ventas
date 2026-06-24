// API Services - Usando funciones centralizadas
// Los servicios están definidos en api-services.js

// ========================
// VARIABLES GLOBALES
// ========================
let campaigns = [];
let events = [];
let selectedCampaignId = null;
let editingCampaignId = null;
let editingEventId = null;

/**
 * Cargar todas las campañas desde el backend
 */
async function cargarCampanasDelBackend() {
  try {  

        // Leer y parsear
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
     
    const dataCampanas = {  
        id : 0, 
        estatus : 'ALTA',  
        roluser : 'ADMIN',    
        id_empresa : sesionUser.id   
    }       

    const data = await CampanasService.obtenerTodas(dataCampanas);  

    console.log('Datos obtenidos del backend:', data); // Log para verificar datos 
    console.log('Tipo de dato:', typeof data);
    console.log('Es array:', Array.isArray(data)); 
    console.log('Contenido de data:', data);  

    // Manejar si los datos vienen envueltos en un objeto
    if (data && typeof data === 'object' && !Array.isArray(data) && data.body) { 
        console.log('Datos encontrados en data.body:', data.body);   
        campaigns = data.body || [];     

    } else if (Array.isArray(data)) { 
     console.log('Datos son un array:', data); 
      campaigns = data;
    } else { 
      console.warn('Formato de datos inesperado:', data);   
      // campaigns = [];  
      campaigns = data ? [data] : [];

    }
    
    console.log('Campañas asignadas:', campaigns);
    renderizarCampañas();
  } catch (error) {
    console.error('Error al cargar campañas:', error);
    campaigns = [];
    alert('Error al cargar campañas: ' + error.message);
  }
}

/**
 * Guardar nueva campaña o actualizar existente
 */
async function guardarCampañaBackend(e) {
  e.preventDefault();

  const texto = document.getElementById('campaignText').value.trim();
  const imagen = document.getElementById('campaignImage').value.trim();
  const estatus = document.getElementById('campaignStatus').value; 
  const tipocliente = document.getElementById('campaignTipocliente').value.trim(); 

  if (!texto) {
    alert('Ingrese el texto de la campaña');
    return;
  }

  const campaignData = { 
    id : 0, 
    id_empresa: 1,
    texto_informa: texto,
    id_emagen: imagen || 'ALTA', 
    estatus: estatus, 
    tipo_cliente: tipocliente || 'NUEVO' 
  };

  try {
    let result;

    if (editingCampaignId) {
      // Actualizar campaña existente usando servicio 
      campaignData.id = editingCampaignId; // Asegurar que el ID se envía para la actualización 

      result = await CampanasService.actualizar(editingCampaignId, campaignData);
      
      // Actualizar en el array local
      const campaign = campaigns.find(c => c.id === editingCampaignId);
      if (campaign) {
        Object.assign(campaign, campaignData);
      }
    } else {
      // Crear nueva campaña usando servicio
      result = await CampanasService.crear(campaignData);
      campaigns.push(result);
    }

    cancelarFormulario();
    renderizarCampañas();
    alert(editingCampaignId ? 'Campaña actualizada correctamente' : 'Campaña creada correctamente');
  } catch (error) {
    console.error('Error:', error);
    alert('Error: ' + error.message);
  }
}

/**
 * Eliminar campaña
 */
async function eliminarCampaña(campaignId) {
  if (!confirm('¿Está seguro de que desea eliminar esta campaña y todos sus eventos?')) {
    return;
  }

  try {
    // Eliminar campaña usando servicio
    await CampanasService.eliminar(campaignId);

    campaigns = campaigns.filter(c => c.id !== campaignId);
    if (selectedCampaignId === campaignId) {
      selectedCampaignId = null;
      document.getElementById('eventsContent').innerHTML = `
        <div class="events-empty">
          <div>
            <i class="fas fa-inbox"></i>
            <p>Seleccione una campaña para ver sus eventos</p>
          </div>
        </div>
      `;
    }
    renderizarCampañas();
    alert('Campaña eliminada correctamente');
  } catch (error) {
    console.error('Error:', error);
    alert('Error: ' + error.message);
  }
}

// ========================
// FUNCIONES DE EVENTOS
// ========================

/**
 * Cargar eventos de una campaña desde el backend
 */
async function cargarEventosDelBackend(campaignId) {
  try {
    const data = await EventoCampanaService.obtenerPorCampana(campaignId);
    console.log('Eventos obtenidos:', data);
    console.log('Tipo de eventos:', typeof data);
    console.log('Es array:', Array.isArray(data));

    // Manejar si los datos vienen envueltos en un objeto
    if (data && typeof data === 'object' && !Array.isArray(data) && data.body) {
      events = data.body;
    } else if (Array.isArray(data)) {
      events = data;
    } else {
      events = [];
    }
    
    console.log(' - Eventos asignados:', events); 

    renderizarEventos();
  } catch (error) {
    console.error('Error al cargar eventos:', error);
    // Si hay error, mostramos lista vacía
    events = [];
    renderizarEventos();
  }
}

/**
 * Guardar nuevo evento o actualizar existente
 */
async function guardarEventoBackend(e) {
  e.preventDefault();

  const frequency = document.getElementById('eventFrequency').value;
  if (!frequency) {
    alert('Seleccione un tipo de ejecución');
    return;
  }

  let eventData = { 
    id : 0,  
    id_campana: selectedCampaignId,
    ejecucion_mensual: 0,
    dia_mensual: 0,
    ejecuion_diaria: 0,
    dia_lunes: 0,
    dia_martes: 0,
    dia_miercoles: 0,
    dia_jueves: 0,
    dia_viernes: 0,
    dia_sabado: 0,
    dia_domingo: 0,
    estatus: document.getElementById('eventStatus').value
  };

  if (frequency === 'mensual') {
    const day = parseInt(document.getElementById('monthlyDay').value);
    if (!day || day < 1 || day > 31) {
      alert('Ingrese un día válido (1-31)');
      return;
    }
    eventData.ejecucion_mensual = 1;
    eventData.dia_mensual = day;
  } else if (frequency === 'diaria') {
    eventData.ejecuion_diaria = 1;
  } else if (frequency === 'semanal') {
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const selected = dias.filter(dia => document.getElementById(`day_${dia}`).checked);
    if (selected.length === 0) {
      alert('Seleccione al menos un día de la semana');
      return;
    }
    dias.forEach(dia => {
      if (document.getElementById(`day_${dia}`).checked) {
        eventData[`dia_${dia}`] = 1;
      }
    });
  }

  try {
    let result;

    if (editingEventId) {
      // Actualizar evento existente usando servicio
      result = await EventoCampanaService.actualizar(editingEventId, eventData);
      
      // Actualizar en el array local
      const event = events.find(e => e.id === editingEventId);
      if (event) {
        Object.assign(event, eventData);
      }
    } else {
      // Crear nuevo evento usando servicio
      result = await EventoCampanaService.crear(eventData);
      events.push(result);
    }

    cerrarModal();
    renderizarEventos();
    alert(editingEventId ? 'Evento actualizado correctamente' : 'Evento creado correctamente');
  } catch (error) {
    console.error('Error:', error);
    alert('Error: ' + error.message);
  }
}

/**
 * Eliminar evento
 */
async function eliminarEvento(eventId) {
  if (!confirm('¿ Está seguro de que desea eliminar este evento ?')) {
    return;
  }

  try {
    // Eliminar evento usando servicio
    await EventoCampanaService.eliminar(eventId);

    events = events.filter(e => e.id !== eventId);
    renderizarEventos();
    alert('Evento eliminado correctamente');
  } catch (error) {
    console.error('Error:', error);
    alert('Error: ' + error.message);
  }
}

// ========================
// FUNCIONES DE RENDERIZADO
// ========================

/**
 * Renderizar lista de campañas
 */
function renderizarCampañas() {
  const list = document.getElementById('campaignsList'); 
  const btnaddcampaign = document.getElementById('btnAddCampaign'); 

  
  // Asegurar que campaigns es un array
  if (!Array.isArray(campaigns)) {
    console.warn('campaigns no es un array:', campaigns);
    campaigns = [];
  }
  
  if (campaigns.length === 0) {
    list.innerHTML = '<div class="no-campaign-message"><i class="fas fa-inbox"></i><p>No hay campañas. Cree una nueva.</p></div>';
    return;
  } 

  if (campaigns.length >= 4) {   
    btnaddcampaign.style.display = 'flex'; 
    btnaddcampaign.style.visibility = 'hidden';  
  }  else {  
    btnaddcampaign.style.display = 'flex'; 
    btnaddcampaign.style.visibility = 'visible'; 
  }

  list.innerHTML = campaigns.map(campaign => `
    <div class="campaign-item ${campaign.id === selectedCampaignId ? 'active' : ''}" onclick="seleccionarCampaña(${campaign.id})">
      <div class="campaign-info">
        <div class="campaign-name">${(campaign.texto_informa || '').substring(0, 100)}${(campaign.texto_informa || '').length > 100 ? '...' : ''}</div>
        <div class="campaign-desc">ID de Imagen: ${campaign.id_emagen || 'N/A'}</div> 
        <div class="campaign-desc">Tipo de Cliente: ${campaign.tipo_cliente || 'N/A'}</div>  
        <div class="campaign-date">Estado: <strong>${campaign.estatus || 'N/A'}</strong></div> 

      </div>
      <div class="campaign-actions" onclick="event.stopPropagation();">
        <button class="btn-edit-sm" onclick="editarCampaña(${campaign.id})" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-delete-sm" onclick="eliminarCampaña(${campaign.id})" title="Eliminar">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

/**
 * Seleccionar campaña y cargar sus eventos
 */
function seleccionarCampaña(campaignId) {
  selectedCampaignId = campaignId;
  editingCampaignId = null;
  document.getElementById('campaignFormSection').style.display = 'none';
  renderizarCampañas();
  cargarEventosDelBackend(campaignId);
}

/**
 * Abrir formulario para nueva campaña
 */
function abrirNuevaCampaña() { 
  editingCampaignId = null;
  document.getElementById('formTitle').textContent = 'Nueva Campaña';
  document.getElementById('campaignForm').reset();
  document.getElementById('campaignFormSection').style.display = 'block';
  document.getElementById('campaignText').focus();
}

/**
 * Editar campaña existente
 */
function editarCampaña(campaignId) {
  const campaign = campaigns.find(c => c.id === campaignId);
  if (!campaign) return;

  editingCampaignId = campaignId;
  document.getElementById('formTitle').textContent = 'Editar Campaña';
  document.getElementById('campaignText').value = campaign.texto_informa;
  document.getElementById('campaignImage').value = campaign.id_emagen || ''; 
  // document.getElementById('campaignTipocliente').value = campaign.tipo_cliente + '⭐' || ''; 
  document.getElementById('campaignTipocliente').value = (campaign.tipo_cliente || '') + '⭐';
  document.getElementById('campaignStatus').value = campaign.estatus;
  document.getElementById('campaignFormSection').style.display = 'block';   
  document.getElementById('campaignText').focus();
}

/**
 * Cancelar formulario
 */
function cancelarFormulario() {
  document.getElementById('campaignFormSection').style.display = 'none';
  document.getElementById('campaignForm').reset();
  editingCampaignId = null;
}

/**
 * Renderizar eventos de campaña
 */
function renderizarEventos() {
  const content = document.getElementById('eventsContent');
  const btnAddEvent = document.getElementById('btnAddEvent'); 
  
  
  // Asegurar que events es un array
  if (!Array.isArray(events)) {
    console.warn('events no es un array:', events);
    events = [];
  }
  
  if (events.length === 0) {
    content.innerHTML = `
      <div class="events-empty">
        <div>
          <i class="fas fa-calendar"></i>
          <p>No hay eventos para esta campaña</p>
        </div>
      </div>
    `;

     btnAddEvent.style.display = 'flex';  
     btnAddEvent.style.visibility = 'visible'; 
    return; 

  } else {

        console.log(' --> Eventos encontrados:', events.length); // Log para verificar eventos  
        btnAddEvent.style.display = 'flex';    
        btnAddEvent.style.visibility = events.length >= 3 ? 'hidden' : 'visible';

    } 

  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  
  content.innerHTML = `
    <div class="events-table">
      <div class="events-header">
        <div>Tipo</div>
        <div>Configuración</div>
        <div>Estado</div>
        <div style="text-align: center;">Acciones</div>
      </div>
      <div class="events-list">
        ${events.map(event => {
          let config = '';
          if (event.ejecucion_mensual) {
            config = `Mensual: Día ${event.dia_mensual}`;
          } else if (event.ejecuion_diaria) {
            config = 'Diaria';
          } else {
            const diasSeleccionados = dias.filter((dia, idx) => event[`dia_${dia}`]).map(d => d.substring(0, 3).toUpperCase());
            config = `${diasSeleccionados.join(', ')}`;
          }

          return `
            <div class="event-row">
              <div>
                ${event.ejecucion_mensual ? '<span class="event-freq">Mensual</span>' : 
                  event.ejecucion_diaria ? '<span class="event-freq">Diaria</span>' : 
                  '<span class="event-freq">Semanal</span>'}
              </div>
              <div>${config || 'N/A'}</div>
              <div><span class="day-badge" style="background-color: ${event.estatus === 'ALTA' ? 'var(--primary-color)' : 'var(--gray-color)'}">${event.estatus}</span></div>
              <div class="event-actions">
                <button class="btn-event-edit" onclick="editarEvento(${event.id})" title="Editar">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-event-delete" onclick="eliminarEvento(${event.id})" title="Eliminar">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
  btnAddEvent.style.display = 'flex';
}

/**
 * Abrir modal para nuevo evento
 */
function abrirNuevoEvento() {
  if (!selectedCampaignId) {
    alert('Seleccione una campaña primero');
    return;
  }
  editingEventId = null;
  document.getElementById('eventModalTitle').textContent = 'Nuevo Evento de Campaña';
  document.getElementById('eventForm').reset();
  document.getElementById('eventFrequency').value = '';
  document.getElementById('monthlyOptions').style.display = 'none';
  document.getElementById('weeklyOptions').style.display = 'none';
  document.getElementById('eventModal').classList.add('show');
}

/**
 * Editar evento
 */
function editarEvento(eventId) {
  const event = events.find(e => e.id === eventId);
  if (!event) return;

  editingEventId = eventId;
  document.getElementById('eventModalTitle').textContent = 'Editar Evento';

  if (event.ejecucion_mensual) {
    document.getElementById('eventFrequency').value = 'mensual';
    document.getElementById('monthlyDay').value = event.dia_mensual;
  } else if (event.ejecuion_diaria) {
    document.getElementById('eventFrequency').value = 'diaria';
  } else {
    document.getElementById('eventFrequency').value = 'semanal';
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    dias.forEach(dia => {
      if (event[`dia_${dia}`]) {
        document.getElementById(`day_${dia}`).checked = true;
      }
    });
  }

  document.getElementById('eventStatus').value = event.estatus;
  cambiarFrecuencia();
  document.getElementById('eventModal').classList.add('show');
}

/**
 * Cambiar frecuencia (mostrar opciones correspondientes)
 */
function cambiarFrecuencia() {
  const frequency = document.getElementById('eventFrequency').value;
  document.getElementById('monthlyOptions').style.display = frequency === 'mensual' ? 'block' : 'none';
  document.getElementById('weeklyOptions').style.display = frequency === 'semanal' ? 'block' : 'none';
}

/**
 * Cerrar modal
 */
function cerrarModal() {
  document.getElementById('eventModal').classList.remove('show');
  document.getElementById('eventForm').reset();
  editingEventId = null;
}

/**
 * Volver al tablero
 */
function volverAlTablero() {
  window.location.href = '/';
}

/**
 * Logout
 */
function logout() {
  if (confirm('¿Desea cerrar sesión?')) {
    localStorage.clear();
    window.location.href = '/login';
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  // Cargar campañas del backend
  cargarCampanasDelBackend();
  
  // Asignar listeners de formularios
  const campaignForm = document.getElementById('campaignForm');
  if (campaignForm) {
    campaignForm.addEventListener('submit', guardarCampañaBackend);
  }

  const eventForm = document.getElementById('eventForm');
  if (eventForm) {
    eventForm.addEventListener('submit', guardarEventoBackend);
  }

  // Cerrar modal al hacer clic fuera
  const eventModal = document.getElementById('eventModal');
  if (eventModal) {
    eventModal.addEventListener('click', (e) => {
      if (e.target.id === 'eventModal') {
        cerrarModal();
      }
    });
  }
});
