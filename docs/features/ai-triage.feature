@ai @triage
Funcionalidad: Clasificacion inteligente de tickets (IA)

  Antecedentes:
    Dado que el modulo de IA analiza texto en espanol
    Y utiliza patrones de expresiones regulares para clasificar

  Escenario: Clasificar ticket simple via triage
    Cuando envio una solicitud POST a "/api/ai/triage"
    Y el cuerpo de la solicitud es:
      """
      {
        "text": "Mi impresora tiene papel atascado"
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y el cuerpo de la respuesta tiene la estructura:
      """
      {
        "complexity": "SIMPLE",
        "category": "string",
        "solution": "string",
        "requiresPayment": false,
        "reason": "string",
        "suggestedAction": "string",
        "estimatedCost": 0,
        "sentiment": {
          "level": "string",
          "score": "number",
          "matches": "array"
        },
        "priorityOverride": "string|null"
      }
      """
    Y "complexity" es "SIMPLE"
    Y "solution" contiene instrucciones para resolver el problema
    Y "requiresPayment" es false

  Escenario: Clasificar ticket complejo que requiere pago
    Cuando envio una solicitud POST a "/api/ai/triage"
    Y el cuerpo de la solicitud es:
      """
      {
        "text": "Se rompio la pantalla de mi laptop"
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y "complexity" es "COMPLEX"
    Y "requiresPayment" es true
    Y "estimatedCost" es 2000

  Escenario: Clasificar ticket de complejidad media
    Cuando envio una solicitud POST a "/api/ai/triage"
    Y el cuerpo de la solicitud es:
      """
      {
        "text": "Necesito instalar Office 365 en mi computadora"
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y "complexity" es "MEDIUM"
    Y "requiresPayment" es false
    Y "suggestedAction" incluye "Crear un ticket"

  Escenario: Clasificar ticket con texto muy corto devuelve 400
    Cuando envio una solicitud POST a "/api/ai/triage"
    Y el cuerpo de la solicitud es:
      """
      {
        "text": "AB"
      }
      """
    Entonces recibo una respuesta con codigo 400
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "Describe tu problema brevemente"
      }
      """

  Escenario: Analizar sentimiento de un ticket
    Cuando envio una solicitud POST a "/api/ai/sentiment"
    Y el cuerpo de la solicitud es:
      """
      {
        "title": "Sistema caido",
        "description": "El servidor principal no funciona y hemos perdido acceso a todos los datos"
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y el cuerpo de la respuesta tiene la estructura:
      """
      {
        "sentiment": {
          "level": "string",
          "score": "number",
          "matches": "array"
        },
        "priorityOverride": "string|null"
      }
      """
    Y "sentiment.level" es "CRITICAL"
    Y "priorityOverride" es "URGENT"

  Escenario: Analizar sentimiento de un ticket calmado
    Cuando envio una solicitud POST a "/api/ai/sentiment"
    Y el cuerpo de la solicitud es:
      """
      {
        "title": "Consulta sobre Office",
        "description": "Buen dia, quisiera saber como instalar Word en mi computadora"
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y "sentiment.level" es "CALM"
    Y "priorityOverride" es null

  Escenario: Analizar sentimiento sin titulo devuelve 400
    Cuando envio una solicitud POST a "/api/ai/sentiment"
    Y el cuerpo de la solicitud es:
      """
      {
        "description": "Descripcion sin titulo"
      }
      """
    Entonces recibo una respuesta con codigo 400
    Y el cuerpo de la respuesta contiene "error"

  Escenario: Buscar tickets similares resueltos
    Dado que estoy autenticado como usuario de la organizacion "org-001"
    Y existen tickets resueltos con descripciones similares en mi organizacion
    Cuando envio una solicitud POST a "/api/ai/search-similar"
    Y el cuerpo de la solicitud es:
      """
      {
        "title": "Problema con la impresora",
        "description": "La impresora no imprime desde esta manana"
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y el cuerpo de la respuesta tiene la estructura:
      """
      {
        "results": [
          {
            "id": "string",
            "title": "string",
            "similarity": "number",
            "category": "string"
          }
        ]
      }
      """
    Y "results" es un array con hasta 5 elementos
    Y los resultados estan ordenados por similarity descendente
    Y cada resultado tiene similarity mayor a 0.3

  Escenario: Buscar tickets similares sin autenticacion devuelve 400
    Cuando envio una solicitud POST a "/api/ai/search-similar"
    Sin incluir la cabecera "x-org-id"
    Y el cuerpo de la solicitud es:
      """
      {
        "title": "Problema",
        "description": "Descripcion del problema"
      }
      """
    Entonces recibo una respuesta con codigo 400
    Y el cuerpo de la respuesta contiene "error"
