@categories @admin
Funcionalidad: Gestion de categorias de tickets

  Antecedentes:
    Dado que las categorias pertenecen a una organizacion
    Y tienen los campos: id, name, slug, organizationId
    Y el par (slug, organizationId) es unico

  Escenario: Listar categorias de mi organizacion
    Dado que estoy autenticado como usuario de la organizacion "org-001"
    Y existen categorias "Hardware", "Software" y "Red" en mi organizacion
    Cuando envio una solicitud GET a "/api/categories"
    Entonces recibo una respuesta con codigo 200
    Y el cuerpo de la respuesta tiene la estructura:
      """
      {
        "categories": [
          {
            "id": "string",
            "name": "string",
            "slug": "string",
            "organizationId": "string",
            "_count": {
              "tickets": "number",
              "knowledgeArticles": "number"
            }
          }
        ]
      }
      """
    Y las categorias estan ordenadas por nombre ascendentemente
    Y solo incluye categorias de la organizacion "org-001"

  Escenario: Crear una categoria como ADMIN
    Dado que estoy autenticado como ADMIN de la organizacion "org-001"
    Cuando envio una solicitud POST a "/api/categories"
    Y el cuerpo de la solicitud es:
      """
      {
        "name": "Impresoras",
        "slug": "impresoras"
      }
      """
    Entonces recibo una respuesta con codigo 201
    Y el cuerpo de la respuesta tiene la estructura:
      """
      {
        "id": "string",
        "name": "Impresoras",
        "slug": "impresoras",
        "organizationId": "org-001"
      }
      """

  Escenario: Crear categoria con slug duplicado devuelve 409
    Dado que estoy autenticado como ADMIN de la organizacion "org-001"
    Y existe una categoria con slug "impresoras" en mi organizacion
    Cuando envio una solicitud POST a "/api/categories"
    Y el cuerpo de la solicitud es:
      """
      {
        "name": "Impresoras Laser",
        "slug": "impresoras"
      }
      """
    Entonces recibo una respuesta con codigo 409
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "conflict",
        "message": "Ya existe una categoria con ese slug"
      }
      """

  Escenario: Tecnico no puede crear categorias
    Dado que estoy autenticado como TECHNICIAN de la organizacion "org-001"
    Cuando envio una solicitud POST a "/api/categories"
    Y el cuerpo de la solicitud es:
      """
      {
        "name": "Redes",
        "slug": "redes"
      }
      """
    Entonces recibo una respuesta con codigo 403
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "forbidden",
        "message": "Solo administradores pueden crear categorias"
      }
      """

  Escenario: Actualizar categoria como ADMIN
    Dado que estoy autenticado como ADMIN de la organizacion "org-001"
    Y existe una categoria con id "cat-001" y nombre "Hardware"
    Cuando envio una solicitud PATCH a "/api/categories/cat-001"
    Y el cuerpo de la solicitud es:
      """
      {
        "name": "Hardware y Perifericos"
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y la categoria actualizada tiene name "Hardware y Perifericos"

  Escenario: Actualizar categoria con slug ya existente devuelve 409
    Dado que estoy autenticado como ADMIN de la organizacion "org-001"
    Y existe una categoria con id "cat-001" y slug "hardware"
    Y existe otra categoria con slug "perifericos"
    Cuando envio una solicitud PATCH a "/api/categories/cat-001"
    Y el cuerpo de la solicitud es:
      """
      {
        "slug": "perifericos"
      }
      """
    Entonces recibo una respuesta con codigo 409
    Y el cuerpo de la respuesta contiene "error" con valor "conflict"

  Escenario: Eliminar categoria sin tickets asociados
    Dado que estoy autenticado como ADMIN de la organizacion "org-001"
    Y existe una categoria con id "cat-002" sin tickets asociados
    Cuando envio una solicitud DELETE a "/api/categories/cat-002"
    Entonces recibo una respuesta con codigo 200
    Y el cuerpo de la respuesta es:
      """
      {
        "message": "Categoria eliminada"
      }
      """
    Y la categoria "cat-002" ya no existe en la base de datos

  Escenario: Eliminar categoria con tickets asociados devuelve 409
    Dado que estoy autenticado como ADMIN de la organizacion "org-001"
    Y existe una categoria con id "cat-001" que tiene tickets asociados
    Cuando envio una solicitud DELETE a "/api/categories/cat-001"
    Entonces recibo una respuesta con codigo 409
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "conflict",
        "message": "No se puede eliminar una categoria con tickets asociados"
      }
      """

  Escenario: Eliminar categoria inexistente devuelve 404
    Dado que estoy autenticado como ADMIN de la organizacion "org-001"
    Cuando envio una solicitud DELETE a "/api/categories/cat-inexistente"
    Entonces recibo una respuesta con codigo 404
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "not_found",
        "message": "Categoria no encontrada"
      }
      """
