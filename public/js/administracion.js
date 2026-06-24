/**
 * Script de Administración de Notificaciones
 * Gestiona CRUD de la tabla chat_msg_notifica
 * Restricción: máximo 3 registros por empresa
 */

// Variables globales
let notificacionesActuales = [];
let empresasDisponibles = [];
let notificacionEnEdicion = null;

// ========================================
// ABRIR Y CERRAR MODAL
// ========================================

function abrirAdministracion() {
  const modal = document.getElementById('administracionModal');
  modal.classList.add('show');
  modal.style.zIndex = 2000;
  
  // Cargar datos
  // cargarEmpresas(); // queda pendiente de revisar.  
  //  cargarUsuarios();    / rhm puede ser que ya no se use.  
  cargaMsgAutoCarga(); 

}

function cerrarAdministracion() {
  const modal = document.getElementById('administracionModal');
  modal.classList.remove('show');
  limpiarFormAdmin();
}

// ========================================
// CARGAR DATOS
// ========================================

async function cargarEmpresas() {
  try {
    const empresas = await AdministracionService.obtenerEmpresas();
    
    if (!Array.isArray(empresas)) {
      console.error('Error: Las empresas no son un array', empresas);
      return;
    }
    
    empresasDisponibles = empresas;
    const select = document.getElementById('adminEmpresa');
    select.innerHTML = '<option value="">Seleccionar empresa...</option>';
    
    empresas.forEach(empresa => {
      const option = document.createElement('option');
      option.value = empresa.id;
      option.textContent = `Empresa ${empresa.id}`;
      select.appendChild(option);
    });
    
  } catch (error) {
    console.error('Error cargando empresas:', error);
    mostrarNotificacionAdmin('Error al cargar empresas', 'error');
  }
}


async function cargarUsuarios() {
  try {
    const empresas = await AdministracionService.obtenerUsuarios();
    
    if (!Array.isArray(empresas)) {
      console.error('Error: Las empresas no son un array', empresas);
      return;
    }
    
    empresasDisponibles = empresas;
    const select = document.getElementById('adminEmpresa');
    select.innerHTML = '<option value="">Seleccionar empresa...</option>';
    
    empresas.forEach(empresa => {
      const option = document.createElement('option');
      option.value = empresa.id;
      option.textContent = `Empresa ${empresa.id}`;
      select.appendChild(option);
    });
    
  } catch (error) {
    console.error('Error cargando empresas:', error);
    mostrarNotificacionAdmin('Error al cargar empresas', 'error');
  }
}


async function cargaMsgAutoCarga() {
  try {  

            // Leer y parsear
            const storedUser = localStorage.getItem('currentUser');
            const usuariosArray = JSON.parse(storedUser);

            // Como es un array con un solo elemento (el usuario)
            const currentUser = usuariosArray[0];

            // Ahora puedes usar sus propiedades 
            console.log('Dentro de cargaMsgAutoCarga, currentUser:', currentUser);   
            console.log(currentUser.id);            // 1 
            console.log(currentUser.id_empresa);     
          
    const notificaciones = await AdministracionService.obtenerMsgAutoCarga(currentUser.id_empresa);
    
    if (!Array.isArray(notificaciones)) {
      console.error('Error: Las notificaciones no son un array', notificaciones);
      notificacionesActuales = [];
    } else {
      notificacionesActuales = notificaciones;
    }
    
    renderizarNotificaciones();
    
  } catch (error) {
    console.error('Error cargando notificaciones:', error);
    mostrarNotificacionAdmin('Error al cargar notificaciones', 'error');
  }
}

// ========================================
// RENDERIZAR NOTIFICACIONES
// ========================================

function renderizarNotificaciones() {
  const container = document.getElementById('notificacionesContainer');
  
  if (notificacionesActuales.length === 0) {
    container.innerHTML = `
      <div class="no-data">
        <i class="fas fa-inbox" style="font-size: 40px; color: #ddd;"></i>
        <p>No hay notificaciones registradas</p>
      </div>
    `;
    return;
  }
  
  // Agrupar por empresa
  const agrupadoPorEmpresa = {};
  notificacionesActuales.forEach(notif => {
    const empresa = notif.id_empresa;
    if (!agrupadoPorEmpresa[empresa]) {
      agrupadoPorEmpresa[empresa] = [];
    }
    agrupadoPorEmpresa[empresa].push(notif);
  });
  
  let html = '';
  Object.keys(agrupadoPorEmpresa).forEach(empresa => {
    const notifs = agrupadoPorEmpresa[empresa];
    const contador = notifs.length;
    const claseAlerta = contador >= 3 ? 'lleno' : 'disponible';
    
    html += `
      <div class="empresa-section ${claseAlerta}">
        <div class="empresa-header">
          <h4>Empresa ${empresa}</h4>
          <span class="contador-notificaciones">${contador}/3</span>
        </div>
        <div class="notificaciones-list">
    `;
    
    notifs.forEach(notif => {
      html += `
        <div class="notificacion-item">
          <div class="notif-content">
            <p class="notif-mensaje">${notif.mensaje || 'Sin mensaje'}</p>
            <small class="notif-meta">ID: ${notif.id} | Creado: ${notif.fh_creacion || 'N/A'}</small>
          </div>
          <div class="notif-acciones">
            <button class="btn-icon btn-edit" onclick="editarNotificacion(${notif.id}, ${empresa})" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon btn-delete" onclick="eliminarNotificacion(${notif.id})" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// ========================================
// CREAR NOTIFICACIÓN
// ========================================

async function crearNotificacion() {
  const empresaId = document.getElementById('adminEmpresa').value;
  const mensaje = document.getElementById('adminMensaje').value.trim();  
  const radio_msg = document.querySelector('input[name="radio_msg"]:checked');    

  let tipoMsg = ''; 
 
        // Validaciones
        if (!empresaId) {
            mostrarNotificacionAdmin('Debe seleccionar una empresa', 'warning');
            return;
        }
        
        if (!mensaje) {
            mostrarNotificacionAdmin('Debe ingresar un mensaje', 'warning');
            return;
        }
        
        // Verificar límite de 3 por empresa
        const notificacionesEmpresa = notificacionesActuales.filter(
            n => n.id_empresa == empresaId
        );
        
        if (notificacionesEmpresa.length >= 3) {
            mostrarNotificacionAdmin(
            `No puede crear más de 3 notificaciones por empresa. Empresa ${empresaId} ya tiene 3.`,
            'warning'
            );
            return;
        } 

        if (radio_msg.value == 1) {
             tipoMsg = 'CONFIRMACION';
        } else if (radio_msg.value == 2) {
             tipoMsg = 'ACLARACION';
        } else if (radio_msg.value == 3) {
             tipoMsg = 'NEGACION';
        } else {
            mostrarNotificacionAdmin('Debe seleccionar un tipo de mensaje', 'warning');
            return;
        } 
  
  try { 

    console.log('Creando notificación con datos: ', { empresaId, mensaje }); 

    const response = await AdministracionService.crearNotificacion({ 
      id : 0,  //  falta cambiar cuando se actualiza 
      id_empresa: parseInt(empresaId),
      tipo_mensaje : tipoMsg,  
      mensaje: mensaje   
    });
    
    mostrarNotificacionAdmin('Notificación creada correctamente', 'success');
    limpiarFormAdmin();
    cargaMsgAutoCarga(); // Recargar lista
    
  } catch (error) {
    console.error('Error creando notificación:', error);
    mostrarNotificacionAdmin('Error al crear notificación', 'error');
  }
}

// ========================================
// EDITAR NOTIFICACIÓN
// ========================================

function editarNotificacion(id, empresa) {
  const notificacion = notificacionesActuales.find(n => n.id === id);
  
  if (!notificacion) {
    mostrarNotificacionAdmin('Notificación no encontrada', 'error');
    return;
  }
  
console.log(' vemos que tiene Notificacion: ', notificacion);  

if (notificacion.tipo_mensaje == 'CONFIRMACION') {
    document.getElementById('radio_msg1').checked = true;  
} else if (notificacion.tipo_mensaje == 'ACLARACION') {
    document.getElementById('radio_msg2').checked = true;   
} else if (notificacion.tipo_mensaje == 'NEGACION') {
    document.getElementById('radio_msg3').checked = true;    
}

 //  Deshabilita todos los mensajes.  
 document.querySelectorAll('input[name="radio_msg"]').forEach(r => r.disabled = true); 

  // Rellenar formulario con datos de la notificación
  document.getElementById('adminEmpresa').value = empresa;
  document.getElementById('adminMensaje').value = notificacion.mensaje;
  document.getElementById('adminId').value = id;
  notificacionEnEdicion = id;
  
  // Cambiar vista del formulario
  document.getElementById('createGroup').style.display = 'none';
  document.getElementById('editIdGroup').style.display = 'block';
  
  // Scroll al formulario
  document.querySelector('.admin-form-section').scrollIntoView({ behavior: 'smooth' });
}

async function actualizarNotificacion() {
  const id = document.getElementById('adminId').value;
  const empresaId = document.getElementById('adminEmpresa').value;
  const mensaje = document.getElementById('adminMensaje').value.trim(); 
  const radio_msg = document.querySelector('input[name="radio_msg"]:checked');   
  
  if (!mensaje) {
    mostrarNotificacionAdmin('Debe ingresar un mensaje', 'warning');
    return;
  }  

      if (radio_msg.value == 1) {
            tipoMsg = 'CONFIRMACION';
      } else if (radio_msg.value == 2) {
            tipoMsg = 'ACLARACION';
      } else if (radio_msg.value == 3) {
            tipoMsg = 'NEGACION';
      } else {
          mostrarNotificacionAdmin('Debe seleccionar un tipo de mensaje', 'warning');
          return;
      } 

  try {  
   const datosNotificacion = {
      id : id, 
      id_empresa: parseInt(empresaId),
      mensaje: mensaje,  
      tipo_mensaje : tipoMsg   
     }

    const response = await AdministracionService.actualizarNotificacion( datosNotificacion );
    
    mostrarNotificacionAdmin('Notificación actualizada correctamente', 'success');
    limpiarFormAdmin();
    cargaMsgAutoCarga(); // Recargar lista
    
  } catch (error) {
    console.error('Error actualizando notificación:', error);
    mostrarNotificacionAdmin('Error al actualizar notificación', 'error');
  }
}

// ========================================
// ELIMINAR NOTIFICACIÓN
// ========================================

async function eliminarNotificacion(id) {
  if (!confirm('¿Estás seguro que deseas eliminar esta notificación?')) {
    return;
  }
  
  try {
    await AdministracionService.eliminarNotificacion(id);
    mostrarNotificacionAdmin('Notificación eliminada correctamente', 'success');
    cargaMsgAutoCarga(); // Recargar lista
    
  } catch (error) {
    console.error('Error eliminando notificación:', error);
    mostrarNotificacionAdmin('Error al eliminar notificación', 'error');
  }
}

// ========================================
// LIMPIAR FORMULARIO
// ========================================

function limpiarFormAdmin() {
  document.getElementById('adminEmpresa').value = '';
  document.getElementById('adminMensaje').value = '';
  document.getElementById('adminId').value = '';
  notificacionEnEdicion = null;
  
  // Restaurar vista del formulario
  document.getElementById('createGroup').style.display = 'block';
  document.getElementById('editIdGroup').style.display = 'none';  

   document.querySelectorAll('input[name="radio_msg"]').forEach(r => r.disabled = false);  
   document.querySelectorAll('input[name="radio_msg"]').forEach(r => r.checked = false);  
  
  actualizarContadorCaracteres();
}

// ========================================
// CONTADOR DE CARACTERES
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('adminMensaje');
  if (textarea) {
    textarea.addEventListener('input', actualizarContadorCaracteres);
  }
});

function actualizarContadorCaracteres() {
  const textarea = document.getElementById('adminMensaje');
  const counter = document.getElementById('charCount');
  const longitud = textarea.value.length;
  counter.textContent = `${longitud}/255 caracteres`;
  
  // Cambiar color si está cerca del límite
  if (longitud > 200) {
    counter.style.color = '#ff6b6b';
  } else if (longitud > 150) {
    counter.style.color = '#ffa500';
  } else {
    counter.style.color = '#666';
  }
}

// ========================================
// NOTIFICACIONES AL USUARIO
// ========================================

function mostrarNotificacionAdmin(mensaje, tipo = 'info') {
  // Crear elemento de notificación
  const notif = document.createElement('div');
  notif.className = `notif-toast notif-${tipo}`;
  notif.innerHTML = `
    <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : tipo === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
    <span>${mensaje}</span>
  `;
  
  document.body.appendChild(notif);
  
  // Auto remover después de 3 segundos
  setTimeout(() => {
    notif.remove();
  }, 3000);
}


// Inicializar aplicaciinicializarAppón
// Esta funcion toma la info del login  para cargar y mostrar el usuario que se regsistra  
// posteriormente, en otro servicio se toma para cargar el combo de los clientes que estan ligados ese usuario. 
async function inicializarApp() {

  // Simular usuario logueado (en producción vendrá de sesión) 
  /* 
      currentUser = {
        id: 1,
        nombre: 'Juan Pérez',
        rol: 'Operador',
        email: 'juan@example.com'
      }; 
  */ 
 try {  
    console.log(" Manda a ejecutar:  inicializarApp, para mostrar los datos en el Header ");  
 
    const userSesionString = sessionStorage.getItem('userSesion');
    const userSesion = JSON.parse(userSesionString);   // ← convertir a objeto

          console.log("    Obtiene el  valor de la sesion:  ",  userSesion);   
           //Falta mostrar relacionarlo con la empresa.  

            // Leer y parsear
            const storedUser = localStorage.getItem('currentUser');
            const usuariosArray = JSON.parse(storedUser);

            // Como es un array con un solo elemento (el usuario)
            const sesionUser = usuariosArray[0];

            // Ahora puedes usar sus propiedades
            console.log(sesionUser.id);            // 1
            console.log(sesionUser.nombre);        // "Ernesto "
            console.log(sesionUser.tipo_user);     // "DOCTOR"
            console.log(sesionUser.estatus);       // "A"

            console.log('como que todo localStorage se actualiza con la respuesta de la API:', localStorage.getItem('currentUser'));

            document.getElementById('userName').textContent = sesionUser.nombre;
            document.getElementById('userRole').textContent = sesionUser.rol;  
            console.log(' Pinta los usuario es correctamente en el header del dashboard con los siguientes datos:', sesionUser.nombre, sesionUser.rol);              

  
      // Obetenemos los clientes asosiciasdos a la empresa 
       const response = await fetch(`${urlbase}/api/Usuarios/clientesChat/${userSesion.id_empresa}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            } 
          //  body: JSON.stringify(postData)
        });


        const respuesta = await response.json(); 

        console.log('Respuesta API  inicializarApp : ', respuesta);
        
        // Extraer array de mensajes de la respuesta
        const clientes = Array.isArray(respuesta) ? respuesta : (respuesta.body || []);
        
        if (!Array.isArray(clientes)) {
          console.warn('Respuesta no es un array:', respuesta);
          throw new Error('Formato de respuesta inválido'); 

        } else  {
               localStorage.setItem('currentUser', JSON.stringify(respuesta.body));  
        } 
        
       //  Pinta los usaurio (doctores) en el combo   
       // const clientes = await response.json();  
        const selectCliente = document.getElementById('filterCliente');
        
        // Limpiar opciones existentes excepto la primera (Todos)
        selectCliente.innerHTML = '<option value="">Todos los clientes</option>';
        
        // Agregar opciones de clientes
        clientes.forEach(cliente => {
          const option = document.createElement('option');
          option.value = cliente.id;
          option.textContent = cliente.nombre + ' - ' + cliente.tipo_user ;
          selectCliente.appendChild(option);
        });
        
        console.log('Clientes cargados:', clientes);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
        const selectCliente = document.getElementById('filterCliente');
        selectCliente.innerHTML = '<option value="">Error al cargar clientes</option>';
      }


}

    // Función para cargar clientes desde la BD
    async function cargarClientes() {
      try { 

            const storedUser = localStorage.getItem('currentUser');
            const usuariosArray = JSON.parse(storedUser);

            const userSesionString = sessionStorage.getItem('userSesion');
            const userSesion = JSON.parse(userSesionString);   // ← convertir a objeto 

            console.log("Valor obtenido dento de CargaClientes :", userSesion.id_empresa); // 1 

        const response = await fetch(`${urlbase}/api/administracion/${userSesion.id_empresa}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar clientes');
        }

        const clientes = await response.json();
        const selectCliente = document.getElementById('filterCliente');
        
        // Limpiar opciones existentes excepto la primera (Todos)
        selectCliente.innerHTML = '<option value="">Todos los clientes</option>';
        
        // Agregar opciones de clientes
        clientes.forEach(cliente => {
          const option = document.createElement('option');
          option.value = cliente.nombre;
          option.textContent = cliente.nombre;
          selectCliente.appendChild(option);
        });
        
        console.log('Clientes cargados:', clientes);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
        const selectCliente = document.getElementById('filterCliente');
        selectCliente.innerHTML = '<option value="">Error al cargar clientes</option>';
      }
    }

  

// Hacer la función global
window.abrirAdministracion = abrirAdministracion;
window.cerrarAdministracion = cerrarAdministracion;
window.crearNotificacion = crearNotificacion;
window.editarNotificacion = editarNotificacion;
window.actualizarNotificacion = actualizarNotificacion;
window.eliminarNotificacion = eliminarNotificacion;
window.limpiarFormAdmin = limpiarFormAdmin;
window.mostrarNotificacionAdmin = mostrarNotificacionAdmin;
