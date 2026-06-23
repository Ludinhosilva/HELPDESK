@evaluations @tickets
Funcionalidad: Evaluacion de tickets resueltos

  Antecedentes:
    Dado que las evaluaciones tienen un rating numerico entre 1 y 5
    Y un campo opcional comment
    Y la relacion es 1:1 entre ticket y evaluation por usuario

  Escenario: Evaluar un ticket resuelto exitosamente
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con id "ticket-001" y status "RESOLVED" en mi organizacion
    Cuando envio una solicitud POST a "/api/tickets/ticket-001/evaluate"
    Y el cuerpo de la solicitud es:
      """
      {
        "rating": 5,
        "comment": "Excelente servicio, muy rapido"
      }
      """
    Entonces recibo una respuesta con codigo 201
    Y el cuerpo de la respuesta tiene la estructura:
      """
      {
        "id": "string",
        "rating": 5,
        "comment": "string",
        "ticketId": "ticket-001",
        "userId": "string",
        "createdAt": "string"
      }
      """
    Y se crea un registro en TicketHistory con action "EVALUATION"

  Escenario: Evaluar un ticket cerrado exitosamente
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con id "ticket-001" y status "CLOSED" en mi organizacion
    Cuando envio una solicitud POST a "/api/tickets/ticket-001/evaluate"
    Y el cuerpo de la solicitud es:
      """
      {
        "rating": 3
      }
      """
    Entonces recibo una respuesta con codigo 201

  Escenario: Evaluar un ticket no resuelto devuelve 400
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con id "ticket-001" y status "OPEN" en mi organizacion
    Cuando envio una solicitud POST a "/api/tickets/ticket-001/evaluate"
    Y el cuerpo de la solicitud es:
      """
      {
        "rating": 4
      }
      """
    Entonces recibo una respuesta con codigo 400
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "invalid_status",
        "message": "El ticket debe estar resuelto o cerrado antes de evaluar"
      }
      """

  Escenario: Evaluar un ticket en progreso devuelve 400
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con id "ticket-001" y status "IN_PROGRESS"
    Cuando envio una solicitud POST a "/api/tickets/ticket-001/evaluate"
    Y el cuerpo de la solicitud es:
      """
      {
        "rating": 4
      }
      """
    Entonces recibo una respuesta con codigo 400
    Y el cuerpo de la respuesta contiene "error" con valor "invalid_status"

  Escenario: Evaluar el mismo ticket dos veces devuelve 409
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con id "ticket-001" y status "RESOLVED"
    Y ya he evaluado este ticket anteriormente
    Cuando envio una solicitud POST a "/api/tickets/ticket-001/evaluate"
    Y el cuerpo de la solicitud es:
      """
      {
        "rating": 5
      }
      """
    Entonces recibo una respuesta con codigo 409
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "already_evaluated",
        "message": "Ya has evaluado este ticket"
      }
      """

  Escenario: Evaluar ticket sin autenticacion devuelve 401
    Cuando envio una solicitud POST a "/api/tickets/ticket-001/evaluate"
    Sin incluir las cabeceras "x-user-id" y "x-org-id"
    Y el cuerpo de la solicitud es:
      """
      {
        "rating": 4
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

  Escenario: Evaluar con rating menor a 1 devuelve 400
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con id "ticket-001" y status "RESOLVED"
    Cuando envio una solicitud POST a "/api/tickets/ticket-001/evaluate"
    Y el cuerpo de la solicitud es:
      """
      {
        "rating": 0
      }
      """
    Entonces recibo una respuesta con codigo 400
    Y el cuerpo de la respuesta contiene un campo "error" con valor "validation_error"

  Escenario: Evaluar con rating mayor a 5 devuelve 400
    Dado que estoy autenticado como usuario de una organizacion
    Y existe un ticket con id "ticket-001" y status "RESOLVED"
    Cuando envio una solicitud POST a "/api/tickets/ticket-001/evaluate"
    Y el cuerpo de la solicitud es:
      """
      {
        "rating": 6
      }
      """
    Entonces recibo una respuesta con codigo 400
    Y el cuerpo de la respuesta contiene un campo "error" con valor "validation_error"

  Escenario: Evaluar ticket de otra organizacion devuelve 404
    Dado que estoy autenticado como usuario de la organizacion "org-001"
    Y existe un ticket con id "ticket-002" en la organizacion "org-002" con status "RESOLVED"
    Cuando envio una solicitud POST a "/api/tickets/ticket-002/evaluate"
    Y el cuerpo de la solicitud es:
      """
      {
        "rating": 4
      }
      """
    Entonces recibo una respuesta con codigo 404
