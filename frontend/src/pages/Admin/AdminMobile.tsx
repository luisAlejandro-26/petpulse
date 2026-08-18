function AdminMobile() {
  return (
    <div>
      {/* TODO: maquetar version Mobile del Panel de administracion.
          Referencia de layout: Admin/AdminTablet.tsx (misma pantalla,
          una sola columna). Funcionalidad ya disponible en el backend:
          - GET /api/users (lista/busca usuarios) -> api/dashboard.ts: getUsers
          - GET /api/stats/admin (estadisticas)    -> api/dashboard.ts: getAdminStats
          - DELETE /api/users/[id] (eliminar)       -> api/dashboard.ts: deleteUser
          Pendiente de backend: editar el rol de un usuario (aun no existe
          el endpoint PATCH). Por ahora no agregar ese boton hasta que el
          backend lo soporte - avisar en el grupo cuando este listo. */}
      <h1>Panel de administración - Mobile</h1>
    </div>
  )
}

export default AdminMobile