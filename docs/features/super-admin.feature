@super-admin @admin
Funcionalidad: Panel de administracion global (SUPER_ADMIN)

  Antecedentes:
    Dado que el rol SUPER_ADMIN tiene acceso global a todas las organizaciones
    Y los endpoints admin estan bajo "/api/admin/"

  Escenario: Listar todas las organizaciones como SUPER_ADMIN
    Dado que estoy autenticado con rol "SUPER_ADMIN"
    Y existen 3 organizaciones registradas
    Cuando envio una solicitud GET a "/api/admin/organizations"
    Entonces recibo una respuesta con codigo 200
    Y el cuerpo de la respuesta tiene la estructura:
      """
      {
        "organizations": [
          {
            "id": "string",
            "name": "string",
            "slug": "string",
            "planStatus": "string",
            "_count": {
              "users": "number",
              "tickets": "number"
            },
            "subscription": {
              "status": "string",
              "plan": {
                "name": "string",
                "price": "number"
              }
            } | null,
            "createdAt": "string"
          }
        ]
      }
      """
    Y las organizaciones estan ordenadas por createdAt descendente

  Escenario: Obtener detalle de una organizacion como SUPER_ADMIN
    Dado que estoy autenticado con rol "SUPER_ADMIN"
    Y existe una organizacion con id "org-001"
    Cuando envio una solicitud GET a "/api/admin/organizations/org-001"
    Entonces recibo una respuesta con codigo 200
    Y el cuerpo de la respuesta tiene la estructura:
      """
      {
        "organization": {
          "id": "string",
          "name": "string",
          "slug": "string",
          "planStatus": "string",
          "users": [
            {
              "id": "string",
              "name": "string",
              "email": "string",
              "role": "string",
              "isActive": "boolean",
              "createdAt": "string"
            }
          ],
          "_count": {
            "tickets": "number"
          },
          "subscription": {
            "plan": {
              "name": "string",
              "price": "number"
            }
          } | null
        },
        "tickets": [
          {
            "id": "string",
            "title": "string",
            "status": "string",
            "priority": "string",
            "createdBy": { "name": "string" },
            "assignedTo": { "name": "string" } | null,
            "category": { "name": "string" } | null
          }
        ]
      }
      """
    Y "tickets" contiene los ultimos 20 tickets de la organizacion

  Escenario: Obtener organizacion inexistente devuelve 404
    Dado que estoy autenticado con rol "SUPER_ADMIN"
    Cuando envio una solicitud GET a "/api/admin/organizations/org-inexistente"
    Entonces recibo una respuesta con codigo 404
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "not_found",
        "message": "Organizacion no encontrada"
      }
      """

  Escenario: Ver estadisticas globales como SUPER_ADMIN
    Dado que estoy autenticado con rol "SUPER_ADMIN"
    Y existen 10 organizaciones, 50 usuarios y 200 tickets
    Cuando envio una solicitud GET a "/api/admin/stats"
    Entonces recibo una respuesta con codigo 200
    Y el cuerpo de la respuesta tiene la estructura:
      """
      {
        "orgCount": 10,
        "userCount": 50,
        "ticketCount": 200,
        "orgsWithSubs": "number",
        "ticketsByStatus": [
          { "status": "string", "_count": "number" }
        ],
        "ticketsByPriority": [
          { "priority": "string", "_count": "number" }
        ]
      }
      """
    Y "userCount" excluye usuarios con rol SUPER_ADMIN

  Escenario: Registrar SUPER_ADMIN con clave secreta valida
    Cuando envio una solicitud POST a "/api/auth/register-super-admin"
    Y el cuerpo de la solicitud es:
      """
      {
        "name": "Super Admin",
        "email": "super@servidesk.com",
        "password": "SuperSegura2026",
        "secretKey": "servidesk-super-2026"
      }
      """
    Entonces recibo una respuesta con codigo 201
    Y el cuerpo de la respuesta es:
      """
      {
        "message": "Super administrador creado correctamente"
      }
      """
    Y se crea un usuario con rol "SUPER_ADMIN"

  Escenario: Registrar SUPER_ADMIN con clave secreta incorrecta devuelve 403
    Cuando envio una solicitud POST a "/api/auth/register-super-admin"
    Y el cuerpo de la solicitud es:
      """
      {
        "name": "Super Admin",
        "email": "super@servidesk.com",
        "password": "SuperSegura2026",
        "secretKey": "clave-incorrecta"
      }
      """
    Entonces recibo una respuesta con codigo 403
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "forbidden",
        "message": "Clave secreta incorrecta"
      }
      """

  Escenario: Registrar SUPER_ADMIN con email duplicado devuelve 409
    Dado que ya existe un SUPER_ADMIN con email "super@servidesk.com"
    Cuando envio una solicitud POST a "/api/auth/register-super-admin"
    Y el cuerpo de la solicitud es:
      """
      {
        "name": "Otro Super",
        "email": "super@servidesk.com",
        "password": "OtraPass123",
        "secretKey": "servidesk-super-2026"
      }
      """
    Entonces recibo una respuesta con codigo 409
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "conflict",
        "message": "Ya existe un super administrador con ese email"
      }
      """

  Escenario: Registrar SUPER_ADMIN con datos invalidos devuelve 400
    Cuando envio una solicitud POST a "/api/auth/register-super-admin"
    Y el cuerpo de la solicitud es:
      """
      {
        "name": "A",
        "email": "email-invalido",
        "password": "123",
        "secretKey": ""
      }
      """
    Entonces recibo una respuesta con codigo 400
    Y el cuerpo de la respuesta contiene "error" con valor "validation_error"

  Escenario: ADMIN no puede acceder a endpoint de organizaciones
    Dado que estoy autenticado con rol "ADMIN"
    Cuando envio una solicitud GET a "/api/admin/organizations"
    Entonces recibo una respuesta con codigo 403
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "forbidden",
        "message": "Acceso denegado"
      }
      """

  Escenario: TECHNICIAN no puede acceder a endpoint de estadisticas
    Dado que estoy autenticado con rol "TECHNICIAN"
    Cuando envio una solicitud GET a "/api/admin/stats"
    Entonces recibo una respuesta con codigo 403
    Y el cuerpo de la respuesta contiene "error" con valor "forbidden"

  Escenario: END_USER no puede acceder a detalle de organizacion
    Dado que estoy autenticado con rol "END_USER"
    Cuando envio una solicitud GET a "/api/admin/organizations/org-001"
    Entonces recibo una respuesta con codigo 403
    Y el cuerpo de la respuesta contiene "error" con valor "forbidden"

  Escenario: SUPER_ADMIN puede acceder a ruta /super-admin
    Dado que estoy autenticado con rol "SUPER_ADMIN"
    Cuando realizo una solicitud GET a "/super-admin"
    Entonces recibo una respuesta con codigo 200 (pagina renderizada)

  Escenario: ADMIN redirigido de /super-admin a /dashboard
    Dado que estoy autenticado con rol "ADMIN"
    Cuando realizo una solicitud GET a "/super-admin"
    Entonces recibo una redireccion a "/dashboard"
