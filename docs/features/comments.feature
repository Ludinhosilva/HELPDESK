@comments @tickets
Funcionalidad: Comentarios en tickets

  Antecedentes:
    Dado que los comentarios se asocian a un ticket existente
    Y el schema de creacion valida que content no este vacio

  Escenario: Agregar comentario a un ticket exitosamente
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con id "ticket-001" en mi organizacion
    Cuando envio una solicitud POST a "/api/tickets/ticket-001/comments"
    Y el cuerpo de la solicitud es:
      """
      {
        "content": "Ya revise el cable de poder y sigue sin funcionar"
      }
      """
    Entonces recibo una respuesta con codigo 201
    Y el cuerpo de la respuesta tiene la estructura:
      """
      {
        "id": "string",
        "content": "string",
        "ticketId": "ticket-001",
        "authorId": "string",
        "author": { "id": "string", "name": "string" },
        "createdAt": "string"
      }
      """
    Y se crea un registro en TicketHistory con action "COMMENT"

  Escenario: Agregar comentario con contenido vacio devuelve 400
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con id "ticket-001"
    Cuando envio una solicitud POST a "/api/tickets/ticket-001/comments"
    Y el cuerpo de la solicitud es:
      """
      {
        "content": ""
      }
      """
    Entonces recibo una respuesta con codigo 400
    Y el cuerpo de la respuesta contiene un campo "error" con valor "validation_error"
    Y el mensaje es "El comentario no puede estar vacio"

  Escenario: Agregar comentario sin autenticacion devuelve 401
    Cuando envio una solicitud POST a "/api/tickets/ticket-001/comments"
    Sin incluir las cabeceras "x-user-id" y "x-org-id"
    Y el cuerpo de la solicitud es:
      """
      {
        "content": "Comentario de prueba"
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

  Escenario: Agregar comentario a ticket inexistente devuelve 404
    Dado que estoy autenticado como usuario de una organizacion
    Cuando envio una solicitud POST a "/api/tickets/ticket-inexistente/comments"
    Y el cuerpo de la solicitud es:
      """
      {
        "content": "Comentario de prueba"
      }
      """
    Entonces recibo una respuesta con codigo 404
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "not_found",
        "message": "Ticket no encontrado"
      }
      """

  Escenario: Agregar comentario a ticket de otra organizacion devuelve 404
    Dado que estoy autenticado como usuario de la organizacion "org-001"
    Y existe un ticket con id "ticket-002" en la organizacion "org-002"
    Cuando envio una solicitud POST a "/api/tickets/ticket-002/comments"
    Y el cuerpo de la solicitud es:
      """
      {
        "content": "Comentario de prueba"
      }
      """
    Entonces recibo una respuesta con codigo 404
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "not_found",
        "message": "Ticket no encontrado"
      }
      """
