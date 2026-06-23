@users @admin
Funcionalidad: Gestion de usuarios del sistema

  Antecedentes:
    Dado que los usuarios tienen roles: SUPER_ADMIN, ADMIN, TECHNICIAN, END_USER
    Y los usuarios estan vinculados a una organizacion (excepto SUPER_ADMIN)

  Escenario: Listar usuarios de mi organizacion
    Dado que estoy autenticado como ADMIN de la organizacion "org-001"
    Y existen 5 usuarios en la organizacion "org-001"
    Cuando envio una solicitud GET a "/api/users"
    Entonces recibo una respuesta con codigo 200
    Y el cuerpo de la respuesta tiene la estructura:
      """
      {
        "users": [
          {
            "id": "string",
            "name": "string",
            "email": "string",
            "role": "string",
            "isActive": "boolean",
            "createdAt": "string"
          }
        ]
      }
      """
    Y la respuesta contiene exactamente 5 usuarios
    Y todos los usuarios pertenecen a la organizacion "org-001"

  Escenario: SUPER_ADMIN lista usuarios de todas las organizaciones
    Dado que estoy autenticado con rol "SUPER_ADMIN"
    Cuando envio una solicitud GET a "/api/users"
    Entonces recibo una respuesta con codigo 200
    Y la respuesta excluye usuarios con rol "SUPER_ADMIN"

  Escenario: Invitar un nuevo usuario como ADMIN
    Dado que estoy autenticado como ADMIN de la organizacion "org-001"
    Cuando envio una solicitud POST a "/api/users"
    Y el cuerpo de la solicitud es:
      """
      {
        "name": "Maria Lopez",
        "email": "maria@techsolutions.com",
        "role": "TECHNICIAN",
        "password": "Tecnico2024"
      }
      """
    Entonces recibo una respuesta con codigo 201
    Y el cuerpo de la respuesta tiene la estructura:
      """
      {
        "id": "string",
        "name": "Maria Lopez",
        "email": "maria@techsolutions.com",
        "role": "TECHNICIAN",
        "isActive": true
      }
      """

  Escenario: Invitar usuario con email duplicado devuelve 409
    Dado que estoy autenticado como ADMIN de la organizacion "org-001"
    Y existe un usuario con email "existente@test.com" en "org-001"
    Cuando envio una solicitud POST a "/api/users"
    Y el cuerpo de la solicitud es:
      """
      {
        "name": "Duplicado",
        "email": "existente@test.com",
        "role": "TECHNICIAN",
        "password": "Password123"
      }
      """
    Entonces recibo una respuesta con codigo 409
    Y el cuerpo de la respuesta contiene "error" con valor "conflict"

  Escenario: Usuario sin rol ADMIN no puede invitar usuarios
    Dado que estoy autenticado como TECHNICIAN de la organizacion "org-001"
    Cuando envio una solicitud POST a "/api/users"
    Y el cuerpo de la solicitud es:
      """
      {
        "name": "Nuevo Usuario",
        "email": "nuevo@test.com",
        "role": "END_USER",
        "password": "Password123"
      }
      """
    Entonces recibo una respuesta con codigo 403
    Y el cuerpo de la respuesta contiene "error" con valor "forbidden"

  Escenario: Actualizar rol de un usuario
    Dado que estoy autenticado como ADMIN de la organizacion "org-001"
    Y existe un usuario con id "user-003" y rol "END_USER" en mi organizacion
    Cuando envio una solicitud PATCH a "/api/users/user-003"
    Y el cuerpo de la solicitud es:
      """
      {
        "role": "TECHNICIAN"
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y el usuario actualizado tiene rol "TECHNICIAN"

  Escenario: Desactivar un usuario
    Dado que estoy autenticado como ADMIN de la organizacion "org-001"
    Y existe un usuario activo con id "user-003" en mi organizacion
    Cuando envio una solicitud PATCH a "/api/users/user-003"
    Y el cuerpo de la solicitud es:
      """
      {
        "isActive": false
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y el usuario tiene isActive igual a false

  Escenario: Listar usuarios sin autenticacion devuelve 401
    Cuando envio una solicitud GET a "/api/users"
    Sin incluir la cookie "token"
    Entonces recibo una respuesta con codigo 401
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "unauthorized",
        "message": "No autorizado"
      }
      """
