@payments @sla
Funcionalidad: Procesamiento de pagos para SLA Premium

  Antecedentes:
    Dado que el SLA Premium tiene un precio de S/20.00 (2000 centimos)
    Y el SLA Premium otorga respuesta garantizada en menos de 2 horas
    Y el pago se procesa de forma asincrona con una simulacion de 3 segundos

  Escenario: Procesar pago exitoso para SLA Premium
    Dado que estoy autenticado como usuario de la organizacion "org-001"
    Y existe un ticket con id "ticket-001" sin SLA activo
    Cuando envio una solicitud POST a "/api/payments"
    Y el cuerpo de la solicitud es:
      """
      {
        "ticketId": "ticket-001"
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y el cuerpo de la respuesta tiene la estructura:
      """
      {
        "status": "APPROVED",
        "slaExpiresAt": "string (ISO date)",
        "paymentReference": "string",
        "ticket": {
          "id": "ticket-001",
          "priority": "URGENT",
          "paymentStatus": "APPROVED",
          "slaExpiresAt": "string (ISO date)"
        }
      }
      """
    Y "status" es "APPROVED"
    Y el ticket pasa a tener priority "URGENT"
    Y el ticket tiene paymentAmount igual a 2000
    Y se crea un registro en TicketHistory con action "SLA_ACTIVATED"

  Escenario: Procesar pago fallido para SLA Premium
    Dado que estoy autenticado como usuario de la organizacion "org-001"
    Y existe un ticket con id "ticket-002" sin SLA activo
    Cuando envio una solicitud POST a "/api/payments"
    Y el cuerpo de la solicitud es:
      """
      {
        "ticketId": "ticket-002"
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y el cuerpo de la respuesta contiene:
      """
      {
        "status": "FAILED"
      }
      """
    Y "status" es "FAILED"
    Y "slaExpiresAt" es null
    Y el ticket mantiene su priority original
    Y se crea un registro en TicketHistory con action "PAYMENT_FAILED"

  Escenario: Procesar pago sin autenticacion devuelve 401
    Cuando envio una solicitud POST a "/api/payments"
    Sin incluir las cabeceras "x-user-id" y "x-org-id"
    Y el cuerpo de la solicitud es:
      """
      {
        "ticketId": "ticket-001"
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

  Escenario: Procesar pago para ticket inexistente devuelve 404
    Dado que estoy autenticado como usuario de la organizacion "org-001"
    Cuando envio una solicitud POST a "/api/payments"
    Y el cuerpo de la solicitud es:
      """
      {
        "ticketId": "ticket-inexistente"
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

  Escenario: Procesar pago sin ticketId devuelve 400
    Dado que estoy autenticado como usuario de la organizacion "org-001"
    Cuando envio una solicitud POST a "/api/payments"
    Y el cuerpo de la solicitud es:
      """
      {}
      """
    Entonces recibo una respuesta con codigo 400
    Y el cuerpo de la respuesta contiene "error" con valor "validation"

  Escenario: Procesar pago para ticket ya con SLA activo devuelve 400
    Dado que estoy autenticado como usuario de la organizacion "org-001"
    Y existe un ticket con id "ticket-001" y paymentStatus "APPROVED"
    Cuando envio una solicitud POST a "/api/payments"
    Y el cuerpo de la solicitud es:
      """
      {
        "ticketId": "ticket-001"
      }
      """
    Entonces recibo una respuesta con codigo 400
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "already_paid",
        "message": "Este ticket ya tiene SLA premium activo"
      }
      """
