// Roles de usuario y permisos
const ROLES = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  OPERADOR: 'Operador'
};

// Permisos por rol
const PERMISOS = {
  'Administrador': ['crear', 'editar', 'eliminar', 'ver_reportes', 'gestionar_usuarios', 'cambiar_todas_fases'],
  'Supervisor': ['editar', 'ver_reportes', 'cambiar_fases_asignadas'],
  'Operador': ['editar', 'cambiar_fases_propias']
};

// Estados del tablero
const ESTADOS = {
  RECEPCION: 'Recepción',
  ORDEN: 'Orden',
  EMPAQUETADO: 'En empaquetado',
  LISTA_ENTREGA: 'Lista para Entrega',
  EN_RUTA: 'En ruta',
  ENTREGADO: 'Entregado'
};

// Orden de estados para el flujo
const ORDEN_ESTADOS = [
  'Recepción',
  'Orden',
  'En empaquetado',
  'Lista para Entrega',
  'En ruta',
  'Entregado'
];

module.exports = {
  ROLES,
  PERMISOS,
  ESTADOS,
  ORDEN_ESTADOS
};
