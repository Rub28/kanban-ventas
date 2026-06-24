/**
 * Script de Dashboard de Reportes
 * Gestiona los 3 dashboards con datos de clientes, movimientos y entregas
 */

// Variables globales
let clientesActivos = [];
let movimientos = [];
let entregas = [];

// Función para esperar a que las librerías se carguen
function esperarLibrerias() {
  return new Promise((resolve) => {
    const maxIntentos = 50; // 5 segundos máximo (50 * 100ms)
    let intento = 0;
    
    const verificar = setInterval(() => {
      if (typeof window.XLSX !== 'undefined' && typeof window.html2pdf !== 'undefined') {
        clearInterval(verificar);
        console.log('Librerías cargadas correctamente:', { XLSX: !!window.XLSX, html2pdf: !!window.html2pdf });
        resolve();
      } else if (intento >= maxIntentos) {
        clearInterval(verificar);
        console.warn('Timeout esperando librerías. XLSX:', typeof window.XLSX, 'html2pdf:', typeof window.html2pdf);
        resolve(); // Resolver de todas formas para no bloquear
      }
      intento++;
    }, 100);
  });
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Dashboard de Reportes iniciado');
  await esperarLibrerias();
  inicializarFiltros(); 
  console.log (" veamos en que momento se pinta esta ");    
  //  Podemos cargar  el llenado del combo de empresas   
  
  
});

/**
 * Cambiar entre pestañas
 */
function cambiarTab(tabName) {
  // Ocultar todas las pestañas
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Desactivar todos los botones
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Mostrar pestaña seleccionada
  document.getElementById(tabName).classList.add('active');
  
  // Activar botón
  event.target.classList.add('active');
  
  // Cargar datos según la pestaña
  if (tabName === 'tab-clientes') {
    cargarClientesPorEmpresa();
  } else if (tabName === 'tab-movimientos') {
    cargarMovimientos();
  } else if (tabName === 'tab-entrega') {
    cargarEntregas();
  }
}

/**
 * Inicializar filtros con empresas
 */
async function inicializarFiltros() {
  try {

  //  const empresas = await ReportesService.obtenerEmpresas();
    /*  solo para pruebas se tiene que redefinir como se cargaran las empresas,
     recordemos que se filtra solo por empresa. 

    const selectores = ['filterEmpresa1', 'filterEmpresa2', 'filterEmpresa3'];
    
    selectores.forEach(id => {
      const select = document.getElementById(id);
      if (select) {
        select.innerHTML = '<option value="">-- Selecciona una empresa --</option>';
        
        if (empresas && empresas.length > 0) {
          empresas.forEach(empresa => {
            const option = document.createElement('option');
            option.value = empresa.id;
            option.textContent = empresa.nombre || `Empresa ${empresa.id}`;
            select.appendChild(option);
          });
          
          // Seleccionar la primera empresa
          if (empresas.length > 0) {
            select.value = empresas[0].id;
          }
        }
      }
    });
    */ 

    // Cargar datos del primer dashboard
    cargarClientesPorEmpresa();
    
  } catch (error) {
    console.error('Error al inicializar filtros:', error);
    mostrarNotificacion('Error al cargar empresas', 'error');
  }
}

// ========================================
// DASHBOARD 1: CLIENTES ACTIVOS
// ========================================

/**
 * Cargar clientes activos
 */
async function cargarClientesPorEmpresa() {
  try {
    const empresaId = document.getElementById('filterEmpresa1').value || 1; // Solo para pruebas, se debe eliminar esta línea y usar el valor del filtro.

    if (!empresaId) {
      document.getElementById('tablaClientesContainer').innerHTML = `
        <div class="no-data">
          <p>Por favor selecciona una empresa</p>
        </div>
      `;
      return;
    }
    
    const clientes = await ReportesService.obtenerClientesActivos(empresaId); 

    console.log('--> Clientes activos obtenidos:', clientes.body); // Log para verificar los datos obtenidos 

    
    // Validar que sea un array
    if (!Array.isArray(clientes.body)) {
      console.log('Error: La respuesta no es un array', clientes);
      clientesActivos = [];
    } else {
      clientesActivos = clientes.body;
    }
    
    // Separar por tipo de campaña
    const clientesDiario = clientesActivos.filter(c => c.campana_diario && c.envia_campana);
    const clientesSemanal = clientesActivos.filter(c => c.campana_semana && c.envia_campana);
    const clientesMensual = clientesActivos.filter(c => c.campana_mensual && c.envia_campana);
    
    // Actualizar estadísticas
    document.getElementById('totalClientesStats').textContent = clientesActivos.length;
    document.getElementById('statsDiario').textContent = clientesDiario.length;
    document.getElementById('statsSemanal').textContent = clientesSemanal.length;
    document.getElementById('statsMensual').textContent = clientesMensual.length;
    

    // Renderizar tabla
    renderizarTablaClientes(clientesActivos);
    
  } catch (error) {
    console.error('Error al cargar clientes:', error);
    mostrarNotificacion('Error al cargar clientes', 'error');
  }
}

/**
 * Renderizar tabla de clientes
 */
function renderizarTablaClientes(clientes) {
  if (!clientes || clientes.length === 0) {
    document.getElementById('tablaClientesContainer').innerHTML = `
      <div class="no-data">
        <i class="fas fa-inbox" style="font-size: 40px; color: #ddd;"></i>
        <p>No hay clientes activos</p>
      </div>
    `;
    return;
  }
  
  let html = `
    <table>
      <thead>
        <tr>
          <th>Email</th>
          <th>Teléfono</th>
          <th>Empresa</th>
          <th>Fecha Alta</th>
          <th>Notificaciones</th>
          <th>Campañas</th>
          <th>Enviando</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  clientes.forEach(cliente => {
    const campanasActivas = [];
    if (cliente.campana_diario) campanasActivas.push('D');
    if (cliente.campana_semana) campanasActivas.push('S');
    if (cliente.campana_mensual) campanasActivas.push('M');
    
    const fhAlta = cliente.fh_alta ? new Date(cliente.fh_alta).toLocaleDateString('es-ES') : 'N/A';
    
    html += `
      <tr>
        <td>${cliente.email_cliente || '-'}</td>
        <td>${cliente.phone_number || '-'}</td>
        <td>${cliente.id_empresa || '-'}</td>
        <td>${fhAlta}</td>
        <td>
          <span class="status-badge ${cliente.push_cliente ? 'activo' : 'pendiente'}">
            ${cliente.push_cliente ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td>${campanasActivas.length > 0 ? campanasActivas.join(', ') : '-'}</td>
        <td>
          <span class="status-badge ${cliente.envia_campana ? 'activo' : 'pendiente'}">
            ${cliente.envia_campana ? 'Sí' : 'No'}
          </span>
        </td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  document.getElementById('tablaClientesContainer').innerHTML = html;
}

// ========================================
// DASHBOARD 2: MOVIMIENTOS
// ========================================

/**
 * Cargar movimientos de órdenes
 */
async function cargarMovimientos() {
  try {
    const empresaId = document.getElementById('filterEmpresa2').value;
    const rango = document.getElementById('filterRango').value;
    const fecha = document.getElementById('filterFecha').value;
    /*  
    if (!empresaId) {
      document.getElementById('tablaMovimientosContainer').innerHTML = `
        <div class="no-data">
          <p>Por favor selecciona una empresa</p>
        </div>
      `;
      return;
    }
    */  


    const datos = await ReportesService.obtenerMovimientos({
      id_empresa: empresaId || 1,
      rango: rango, 
      fecha: fecha,  
      id_cliente : 1,  
      estatus : 'A'  
    });
    
    // Validar que sea un array
    if (!Array.isArray(datos.body)) {
      console.error('Error: La respuesta no es un array', datos);
      movimientos = [];
    } else {
      movimientos = datos.body;
    }
    
    // Calcular estadísticas
    const entregadas = movimientos.filter(m => m.estatus === 'Entregado').length;
    const pendientes = movimientos.filter(m => m.estatus === 'Pendiente' || m.estatus === 'En ruta').length;
    const canceladas = movimientos.filter(m => m.estatus === 'Cancelado').length;
    
    document.getElementById('totalOrdenes').textContent = movimientos.length;
    document.getElementById('ordenesEntregadas').textContent = entregadas;
    document.getElementById('ordenesPendientes').textContent = pendientes;
    document.getElementById('ordenesCanceladas').textContent = canceladas;
    
    // Renderizar tabla
    renderizarTablaMovimientos(movimientos);
    
  } catch (error) {
    console.error('Error al cargar movimientos:', error);
    mostrarNotificacion('Error al cargar movimientos', 'error');
  }
}

/**
 * Renderizar tabla de movimientos
 */
function renderizarTablaMovimientos(movimientos) {
  if (!movimientos || movimientos.length === 0) {
    document.getElementById('tablaMovimientosContainer').innerHTML = `
      <div class="no-data">
        <i class="fas fa-inbox" style="font-size: 40px; color: #ddd;"></i>
        <p>No hay movimientos</p>
      </div>
    `;
    return;
  }
  
  let html = `
    <table>
      <thead>
        <tr>
          <th>Folio</th>
          <th>Cliente</th>
          <th>Teléfono</th>
          <th>Mensaje</th>
          <th>Estatus</th>
          <th>Fecha Registro</th>
          <th>Fecha Entrega</th>
          <th>Prioridad</th>
          <th>Usuario</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  movimientos.forEach(mov => {
    const fhReg = mov.fh_registro ? new Date(mov.fh_registro).toLocaleDateString('es-ES') : '-';
    const fhEnt = mov.fh_entrega ? new Date(mov.fh_entrega).toLocaleDateString('es-ES') : '-';
    
    const estatusBadge = {
      'Entregado': 'entregado',
      'Pendiente': 'pendiente',
      'En ruta': 'pendiente',
      'Cancelado': 'cancelado'
    };
    
    html += `
      <tr>
        <td>${mov.id_folio_orden || '-'}</td>
        <td>${mov.pushName || '-'}</td>
        <td>${mov.phone_number || '-'}</td>
        <td>${mov.mensaje ? mov.mensaje.substring(0, 30) + '...' : '-'}</td>
        <td>
          <span class="status-badge ${estatusBadge[mov.estatus] || 'pendiente'}">
            ${mov.estatus || '-'}
          </span>
        </td>
        <td>${fhReg}</td>
        <td>${fhEnt}</td>
        <td>${mov.prioridad_entrega || '-'}</td>
        <td>${mov.id_usuario_actualiza || '-'}</td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  document.getElementById('tablaMovimientosContainer').innerHTML = html;
}

// ========================================
// DASHBOARD 3: CLIENTE VS ENTREGA
// ========================================

/**
 * Cargar datos de cliente vs entrega
 */
async function cargarEntregas() {
  try {
    const empresaId = document.getElementById('filterEmpresa3').value || 1; // Solo para pruebas, se debe eliminar esta línea y usar el valor del filtro.
    const rango = document.getElementById('filterRango2').value;
    const fecha = document.getElementById('filterFecha2').value;
    
    console.log('Cargando entregas con filtros:', { empresaId, rango, fecha }); 


    if (!empresaId) {
      document.getElementById('tablaEntregasContainer').innerHTML = `
        <div class="no-data">
          <p>Por favor selecciona una empresa</p>
        </div>
      `;
      return;
    }
    
    const datos = await ReportesService.obtenerClientesVsEntregas({
      id_empresa: empresaId,
      rango: rango,
      fecha: fecha
    });
    
    // Validar que sea un array
    if (!Array.isArray(datos)) {
      console.error('Error: La respuesta no es un array', datos);
      entregas = [];
    } else {
      entregas = datos;
    }
    
    // Calcular estadísticas
    const clientesUnicos = [...new Set(entregas.map(e => e.phone_number))].length;
    const ordenesEntregadas = entregas.filter(e => e.estatus === 'Entregado').length;
    const tasaEntrega = entregas.length > 0 ? Math.round((ordenesEntregadas / entregas.length) * 100) : 0;
    const promedioOrdenes = clientesUnicos > 0 ? (entregas.length / clientesUnicos).toFixed(2) : 0;
    
    document.getElementById('totalClientes3').textContent = clientesUnicos;
    document.getElementById('totalOrdenes3').textContent = entregas.length;
    document.getElementById('tasaEntrega').textContent = tasaEntrega + '%';
    document.getElementById('promedioOrdenesPorCliente').textContent = promedioOrdenes;
    
    // Renderizar tabla
    renderizarTablaEntregas(entregas);
    
  } catch (error) {
    console.error('Error al cargar entregas:', error);
    mostrarNotificacion('Error al cargar entregas', 'error');
  }
}

/**
 * Renderizar tabla de entregas
 */
function renderizarTablaEntregas(entregas) {
  if (!entregas || entregas.length === 0) {
    document.getElementById('tablaEntregasContainer').innerHTML = `
      <div class="no-data">
        <i class="fas fa-inbox" style="font-size: 40px; color: #ddd;"></i>
        <p>No hay datos</p>
      </div>
    `;
    return;
  }
  
  let html = `
    <table>
      <thead>
        <tr>
          <th>Empresa</th>
          <th>Cliente</th>
          <th>Teléfono</th>
          <th>Mensaje</th>
          <th>Orden ID</th>
          <th>Estatus</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  entregas.forEach(ent => {
    const estatusBadge = {
      'Entregado': 'entregado',
      'Pendiente': 'pendiente',
      'En ruta': 'pendiente',
      'Cancelado': 'cancelado'
    };
    
    html += `
      <tr>
        <td>${ent.id_empresa || '-'}</td>
        <td>${ent.pushName || '-'}</td>
        <td>${ent.phone_number || '-'}</td>
        <td>${ent.mensaje ? ent.mensaje.substring(0, 30) + '...' : '-'}</td>
        <td>${ent.id_orden || '-'}</td>
        <td>
          <span class="status-badge ${estatusBadge[ent.estatus] || 'pendiente'}">
            ${ent.estatus || '-'}
          </span>
        </td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  document.getElementById('tablaEntregasContainer').innerHTML = html;
}

// ========================================
// EXPORTACIÓN A EXCEL
// ========================================

function exportarClientesExcel() {
  exportarTablaExcel('tablaClientesContainer', 'Clientes_Activos.xlsx');
}

function exportarMovimientosExcel() {
  exportarTablaExcel('tablaMovimientosContainer', 'Movimientos_Tarjetas.xlsx');
}

function exportarEntregasExcel() {
  exportarTablaExcel('tablaEntregasContainer', 'Clientes_vs_Entregas.xlsx');
}

function exportarTablaExcel(elementId, nombreArchivo) {
  const tabla = document.getElementById(elementId).querySelector('table');
  
  if (!tabla) {
    mostrarNotificacion('No hay datos para exportar', 'warning');
    return;
  }
  
  // Verificar que XLSX esté disponible globalmente
  if (typeof window.XLSX === 'undefined') {
    mostrarNotificacion('La librería XLSX se está cargando. Intenta nuevamente en unos segundos.', 'info');
    console.warn('XLSX no está disponible aún. Estado:', { XLSX: typeof window.XLSX });
    return;
  }
  
  try {
    const libro = window.XLSX.utils.table_to_book(tabla);
    window.XLSX.writeFile(libro, nombreArchivo);
    mostrarNotificacion(`Archivo ${nombreArchivo} descargado correctamente`, 'success');
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    mostrarNotificacion('Error al exportar a Excel: ' + error.message, 'error');
  }
}

// ========================================
// EXPORTACIÓN A PDF
// ========================================

function exportarClientesPDF() {
  exportarTablaPDF('tablaClientesContainer', 'Clientes_Activos.pdf');
}

function exportarMovimientosPDF() {
  exportarTablaPDF('tablaMovimientosContainer', 'Movimientos_Tarjetas.pdf');
}

function exportarEntregasPDF() {
  exportarTablaPDF('tablaEntregasContainer', 'Clientes_vs_Entregas.pdf');
}

function exportarTablaPDF(elementId, nombreArchivo) {
  const elemento = document.getElementById(elementId);
  
  if (!elemento.querySelector('table')) {
    mostrarNotificacion('No hay datos para exportar', 'warning');
    return;
  }
  
  // Verificar que html2pdf esté disponible
  if (typeof window.html2pdf === 'undefined') {
    mostrarNotificacion('La librería PDF se está cargando. Intenta nuevamente en unos segundos.', 'info');
    console.warn('html2pdf no está disponible aún');
    return;
  }
  
  try {
    const opt = {
      margin: 10,
      filename: nombreArchivo,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
    };
    
    window.html2pdf().set(opt).from(elemento).save();
    mostrarNotificacion(`Archivo ${nombreArchivo} descargado correctamente`, 'success');
  } catch (error) {
    console.error('Error al exportar a PDF:', error);
    mostrarNotificacion('Error al exportar a PDF: ' + error.message, 'error');
  }
}

// ========================================
// FUNCIONES AUXILIARES
// ========================================

function refrescarClientes() {
  cargarClientesPorEmpresa();
}

function refrescarMovimientos() {
  cargarMovimientos();
}

function refrescarEntregas() {
  cargarEntregas();
}

function volverAlTablero() {
  window.location.href = '/';
}

function mostrarNotificacion(mensaje, tipo = 'info') {
  console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
}
