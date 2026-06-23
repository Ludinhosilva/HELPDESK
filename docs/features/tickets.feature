@tickets @crud
Funcionalidad: Gestion de tickets de soporte

  Antecedentes:
    Dado que los tickets tienen los campos: id, ticketNumber, title, description,
    Y status en ["OPEN", "IN_PROGRESS", "ON_HOLD", "RESOLVED", "CLOSED"]
    Y priority en ["LOW", "MEDIUM", "HIGH", "URGENT"]
    Y las transiciones validas entre estados son:
      | Desde       | Hacia                       |
      | OPEN        | IN_PROGRESS, ON_HOLD, CLOSED |
      | IN_PROGRESS | ON_HOLD, RESOLVED           |
      | ON_HOLD     | IN_PROGRESS, CLOSED         |
      | RESOLVED    | CLOSED, OPEN                |
      | CLOSED      | (ninguna)                   |

  Escenario: Crear un ticket exitosamente
    Dado que estoy autenticado como usuario de una organizacion
    Cuando envio una solicitud POST a "/api/tickets"
    Y el cuerpo de la solicitud es:
      """
      {
        "title": "Computadora no enciende",
        "description": "La computadora de escritorio no responde al presionar el boton de encendido",
        "priority": "HIGH"
      }
      """
    Entonces recibo una respuesta con codigo 201
    Y el cuerpo de la respuesta tiene la estructura:
      """
      {
        "id": "string",
        "ticketNumber": "number",
        "title": "string",
        "description": "string",
        "status": "OPEN",
        "priority": "HIGH",
        "organizationId": "string",
        "createdById": "string",
        "createdAt": "string",
        "updatedAt": "string",
        "category": "object|null",
        "createdBy": { "id": "string", "name": "string" },
        "assignedTo": null
      }
      """
    Y se crea un registro en TicketHistory con action "CREATED"

  Escenario: Crear ticket con prioridad por defecto
    Dado que estoy autenticado como usuario de una organizacion
    Cuando envio una solicitud POST a "/api/tickets"
    Y el cuerpo de la solicitud es:
      """
      {
        "title": "Problema con el teclado",
        "description": "Las teclas no responden correctamente en el teclado inalambrico"
      }
      """
    Entonces recibo una respuesta con codigo 201
    Y el ticket creado tiene priority "MEDIUM"

  Escenario: Crear ticket con categoria asignada
    Dado que estoy autenticado como usuario de una organizacion
    Y existe una categoria con id "cat-001"
    Cuando envio una solicitud POST a "/api/tickets"
    Y el cuerpo de la solicitud es:
      """
      {
        "title": "Problema de red",
        "description": "No tengo conexion a internet en el tercer piso",
        "priority": "URGENT",
        "categoryId": "cat-001"
      }
      """
    Entonces recibo una respuesta con codigo 201
    Y el ticket tiene category.id igual a "cat-001"

  Escenario: Crear ticket sin autenticacion devuelve 401
    Cuando envio una solicitud POST a "/api/tickets"
    Sin incluir la cookie "token"
    Y el cuerpo de la solicitud es:
      """
      {
        "title": "Problema",
        "description": "Descripcion del problema de prueba"
      }
      """
    Entonces recibo una respuesta con codigo 401
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "unauthorized",
        "message": "Autenticacion requerida"
      }
      """

  Escenario: Crear ticket con titulo demasiado corto devuelve 400
    Dado que estoy autenticado como usuario de una organizacion
    Cuando envio una solicitud POST a "/api/tickets"
    Y el cuerpo de la solicitud es:
      """
      {
        "title": "AB",
        "description": "Descripcion demasiado corta",
        "priority": "LOW"
      }
      """
    Entonces recibo una respuesta con codigo 400
    Y el cuerpo de la respuesta contiene un campo "error" con valor "validation_error"
    Y el mensaje indica que el titulo debe tener al menos 3 caracteres

  Escenario: Crear ticket con descripcion demasiado corta devuelve 400
    Dado que estoy autenticado como usuario de una organizacion
    Cuando envio una solicitud POST a "/api/tickets"
    Y el cuerpo de la solicitud es:
      """
      {
        "title": "Problema valido",
        "description": "Corto",
        "priority": "MEDIUM"
      }
      """
    Entonces recibo una respuesta con codigo 400
    Y el cuerpo de la respuesta contiene un campo "error" con valor "validation_error"
    Y el mensaje indica que la descripcion debe tener al menos 10 caracteres

  Escenario: Crear ticket con prioridad invalida devuelve 400
    Dado que estoy autenticado como usuario de una organizacion
    Cuando envio una solicitud POST a "/api/tickets"
    Y el cuerpo de la solicitud es:
      """
      {
        "title": "Problema valido",
        "description": "Descripcion con al menos diez caracteres",
        "priority": "CRITICAL"
      }
      """
    Entonces recibo una respuesta con codigo 400
    Y el cuerpo de la respuesta contiene un campo "error" con valor "validation_error"

  Escenario: Listar tickets con paginacion
    Dado que estoy autenticado como usuario de una organizacion
    Y existen 25 tickets en mi organizacion
    Cuando envio una solicitud GET a "/api/tickets?page=1&limit=10"
    Entonces recibo una respuesta con codigo 200
    Y el cuerpo de la respuesta tiene la estructura:
      """
      {
        "tickets": "array",
        "total": 25,
        "page": 1,
        "totalPages": 3
      }
      """
    Y el array "tickets" contiene exactamente 10 elementos

  Escenario: Listar tickets filtrados por estado
    Dado que estoy autenticado como usuario de una organizacion
    Y existen tickets con estado "OPEN", "IN_PROGRESS" y "CLOSED"
    Cuando envio una solicitud GET a "/api/tickets?status=OPEN"
    Entonces recibo una respuesta con codigo 200
    Y todos los tickets en la respuesta tienen status "OPEN"

  Escenario: Listar tickets filtrados por prioridad
    Dado que estoy autenticado como usuario de una organizacion
    Y existen tickets con prioridad "HIGH", "MEDIUM" y "LOW"
    Cuando envio una solicitud GET a "/api/tickets?priority=HIGH"
    Entonces recibo una respuesta con codigo 200
    Y todos los tickets en la respuesta tienen priority "HIGH"

  Escenario: Listar tickets buscando por texto
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con titulo "Computadora no enciende"
    Cuando envio una solicitud GET a "/api/tickets?search=computadora"
    Entonces recibo una respuesta con codigo 200
    Y la respuesta contiene tickets cuyo titulo o descripcion coinciden con "computadora"

  Escenario: Listar tickets buscando por numero de ticket
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con ticketNumber 42
    Cuando envio una solicitud GET a "/api/tickets?search=42"
    Entonces recibo una respuesta con codigo 200
    Y la respuesta incluye el ticket con ticketNumber 42

  Escenario: Obtener un ticket por ID
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con id "ticket-001"
    Cuando envio una solicitud GET a "/api/tickets/ticket-001"
    Entonces recibo una respuesta con codigo 200
    Y el cuerpo de la respuesta tiene la estructura:
      """
      {
        "id": "ticket-001",
        "ticketNumber": "number",
        "title": "string",
        "description": "string",
        "status": "string",
        "priority": "string",
        "category": { "id": "string", "name": "string", "slug": "string" } | null,
        "createdBy": { "id": "string", "name": "string", "email": "string" },
        "assignedTo": { "id": "string", "name": "string", "email": "string" } | null,
        "comments": "array",
        "history": "array",
        "evaluation": "object|null",
        "organizationId": "string",
        "createdAt": "string",
        "updatedAt": "string"
      }
      """

  Escenario: Obtener un ticket inexistente devuelve 404
    Dado que estoy autenticado como usuario de una organizacion
    Cuando envio una solicitud GET a "/api/tickets/id-inexistente"
    Entonces recibo una respuesta con codigo 404
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "not_found",
        "message": "Ticket no encontrado"
      }
      """

  Escenario: Actualizar estado de ticket con transicion valida
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con id "ticket-001" y status "OPEN"
    Cuando envio una solicitud PATCH a "/api/tickets/ticket-001"
    Y el cuerpo de la solicitud es:
      """
      {
        "status": "IN_PROGRESS"
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y el ticket actualizado tiene status "IN_PROGRESS"
    Y se crea un registro en TicketHistory con action "STATUS_CHANGE"

  Escenario: Resolver un ticket establece resolvedAt
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con id "ticket-001" y status "IN_PROGRESS"
    Cuando envio una solicitud PATCH a "/api/tickets/ticket-001"
    Y el cuerpo de la solicitud es:
      """
      {
        "status": "RESOLVED"
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y el ticket tiene status "RESOLVED"
    Y el campo "resolvedAt" no es nulo

  Escenario: Cerrar un ticket establece closedAt
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con id "ticket-001" y status "OPEN"
    Cuando envio una solicitud PATCH a "/api/tickets/ticket-001"
    Y el cuerpo de la solicitud es:
      """
      {
        "status": "CLOSED"
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y el ticket tiene status "CLOSED"
    Y el campo "closedAt" no es nulo

  Escenario: Reabrir un ticket resuelto
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con id "ticket-001" y status "RESOLVED"
    Cuando envio una solicitud PATCH a "/api/tickets/ticket-001"
    Y el cuerpo de la solicitud es:
      """
      {
        "status": "OPEN"
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y el ticket tiene status "OPEN"

  Escenario: Actualizar ticket con transicion invalida devuelve 400
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con id "ticket-001" y status "CLOSED"
    Cuando envio una solicitud PATCH a "/api/tickets/ticket-001"
    Y el cuerpo de la solicitud es:
      """
      {
        "status": "OPEN"
      }
      """
    Entonces recibo una respuesta con codigo 400
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "invalid_transition",
        "message": "No se puede cambiar de CLOSED a OPEN"
      }
      """

  Escenario: Asignar ticket a un usuario
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con id "ticket-001" sin asignar
    Y existe un tecnico con id "user-002"
    Cuando envio una solicitud PATCH a "/api/tickets/ticket-001"
    Y el cuerpo de la solicitud es:
      """
      {
        "assignedToId": "user-002"
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y el ticket tiene assignedTo.id igual a "user-002"
    Y se crea un registro en TicketHistory con action "ASSIGNMENT"

  Escenario: Desasignar ticket de un usuario
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con id "ticket-001" asignado a "user-002"
    Cuando envio una solicitud PATCH a "/api/tickets/ticket-001"
    Y el cuerpo de la solicitud es:
      """
      {
        "assignedToId": null
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y el ticket tiene assignedTo igual a null
    Y se crea un registro en TicketHistory con action "UNASSIGNMENT"

  Escenario: Actualizar prioridad del ticket
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con id "ticket-001" y priority "MEDIUM"
    Cuando envio una solicitud PATCH a "/api/tickets/ticket-001"
    Y el cuerpo de la solicitud es:
      """
      {
        "priority": "URGENT"
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y el ticket tiene priority "URGENT"
    Y se crea un registro en TicketHistory con action "PRIORITY_CHANGE"

  Escenario: Actualizar categoria del ticket
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con id "ticket-001" sin categoria
    Y existe una categoria con id "cat-001"
    Cuando envio una solicitud PATCH a "/api/tickets/ticket-001"
    Y el cuerpo de la solicitud es:
      """
      {
        "categoryId": "cat-001"
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y el ticket tiene category.id igual a "cat-001"
    Y se crea un registro en TicketHistory con action "CATEGORY_CHANGE"

  Escenario: SUPER_ADMIN puede ver tickets de cualquier organizacion
    Dado que estoy autenticado con rol "SUPER_ADMIN"
    Cuando envio una solicitud GET a "/api/tickets?organizationId=org-002"
    Entonces recibo una respuesta con codigo 200
    Y todos los tickets pertenecen a la organizacion "org-002"

  Escenario: Usuario solo ve tickets de su propia organizacion
    Dado que estoy autenticado como usuario de la organizacion "org-001"
    Cuando envio una solicitud GET a "/api/tickets"
    Entonces recibo una respuesta con codigo 200
    Y todos los tickets tienen organizationId igual a "org-001"
