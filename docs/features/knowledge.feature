@knowledge
Funcionalidad: Base de conocimiento

  Antecedentes:
    Dado que los articulos tienen status "DRAFT" o "PUBLISHED"
    Y los articulos pertenecen a una organizacion
    Y el par (slug, organizationId) es unico

  Escenario: Listar articulos publicados
    Dado que estoy autenticado como usuario de la organizacion "org-001"
    Y existen 3 articulos publicados y 2 en borrador en mi organizacion
    Cuando envio una solicitud GET a "/api/knowledge"
    Entonces recibo una respuesta con codigo 200
    Y el cuerpo de la respuesta tiene la estructura:
      """
      {
        "articles": [
          {
            "id": "string",
            "title": "string",
            "content": "string",
            "slug": "string",
            "status": "PUBLISHED",
            "viewCount": "number",
            "helpfulCount": "number",
            "category": "object|null",
            "organizationId": "string",
            "createdAt": "string",
            "updatedAt": "string"
          }
        ]
      }
      """
    Y solo se devuelven articulos con status "PUBLISHED"
    Y los articulos estan ordenados por createdAt descendente

  Escenario: Listar articulos filtrados por categoria
    Dado que estoy autenticado como usuario de la organizacion "org-001"
    Y existen articulos en categoria "cat-001" y "cat-002"
    Cuando envio una solicitud GET a "/api/knowledge?categoryId=cat-001"
    Entonces recibo una respuesta con codigo 200
    Y todos los articulos tienen categoryId igual a "cat-001"

  Escenario: Listar articulos buscando por texto
    Dado que estoy autenticado como usuario de la organizacion "org-001"
    Y existe un articulo con titulo "Como configurar el correo"
    Cuando envio una solicitud GET a "/api/knowledge?search=correo"
    Entonces recibo una respuesta con codigo 200
    Y la respuesta incluye el articulo con titulo "Como configurar el correo"

  Escenario: Obtener articulo por ID incrementa el contador de vistas
    Dado que estoy autenticado como usuario de la organizacion "org-001"
    Y existe un articulo con id "article-001" y viewCount 10
    Cuando envio una solicitud GET a "/api/knowledge/article-001"
    Entonces recibo una respuesta con codigo 200
    Y el cuerpo de la respuesta incluye los campos del articulo
    Y el viewCount del articulo se incrementa a 11

  Escenario: Obtener articulo inexistente devuelve 404
    Dado que estoy autenticado como usuario de la organizacion "org-001"
    Cuando envio una solicitud GET a "/api/knowledge/article-inexistente"
    Entonces recibo una respuesta con codigo 404
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "not_found",
        "message": "Articulo no encontrado"
      }
      """

  Escenario: Crear articulo como ADMIN (DRAFT por defecto)
    Dado que estoy autenticado como ADMIN de la organizacion "org-001"
    Cuando envio una solicitud POST a "/api/knowledge"
    Y el cuerpo de la solicitud es:
      """
      {
        "title": "Como restablecer contrasena",
        "content": "Pasos para restablecer la contrasena en Windows 11...",
        "slug": "restablecer-contrasena-windows"
      }
      """
    Entonces recibo una respuesta con codigo 201
    Y el cuerpo de la respuesta tiene la estructura:
      """
      {
        "id": "string",
        "title": "string",
        "content": "string",
        "slug": "string",
        "status": "DRAFT",
        "viewCount": 0,
        "helpfulCount": 0,
        "category": "object|null",
        "organizationId": "string",
        "createdAt": "string",
        "updatedAt": "string"
      }
      """
    Y el articulo se crea con status "DRAFT"

  Escenario: Crear articulo publicando directamente
    Dado que estoy autenticado como ADMIN de la organizacion "org-001"
    Cuando envio una solicitud POST a "/api/knowledge"
    Y el cuerpo de la solicitud es:
      """
      {
        "title": "Guia de redes",
        "content": "Configuracion basica de redes corporativas...",
        "slug": "guia-redes",
        "status": "PUBLISHED",
        "categoryId": "cat-001"
      }
      """
    Entonces recibo una respuesta con codigo 201
    Y el articulo se crea con status "PUBLISHED"
    Y el articulo tiene category.id igual a "cat-001"

  Escenario: Crear articulo con slug duplicado devuelve 409
    Dado que estoy autenticado como ADMIN de la organizacion "org-001"
    Y existe un articulo con slug "restablecer-contrasena-windows" en mi organizacion
    Cuando envio una solicitud POST a "/api/knowledge"
    Y el cuerpo de la solicitud es:
      """
      {
        "title": "Otro titulo",
        "content": "Contenido del articulo duplicado...",
        "slug": "restablecer-contrasena-windows"
      }
      """
    Entonces recibo una respuesta con codigo 409
    Y el cuerpo de la respuesta contiene "error" con valor "conflict"

  Escenario: Tecnico no puede crear articulos
    Dado que estoy autenticado como TECHNICIAN de la organizacion "org-001"
    Cuando envio una solicitud POST a "/api/knowledge"
    Y el cuerpo de la solicitud es:
      """
      {
        "title": "Articulo de prueba",
        "content": "Contenido de prueba...",
        "slug": "articulo-prueba"
      }
      """
    Entonces recibo una respuesta con codigo 403
    Y el cuerpo de la respuesta contiene "error" con valor "forbidden"

  Escenario: Actualizar articulo como ADMIN
    Dado que estoy autenticado como ADMIN de la organizacion "org-001"
    Y existe un articulo con id "article-001" y status "DRAFT"
    Cuando envio una solicitud PATCH a "/api/knowledge/article-001"
    Y el cuerpo de la solicitud es:
      """
      {
        "title": "Titulo actualizado",
        "status": "PUBLISHED"
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y el articulo actualizado tiene title "Titulo actualizado" y status "PUBLISHED"

  Escenario: Eliminar articulo como ADMIN
    Dado que estoy autenticado como ADMIN de la organizacion "org-001"
    Y existe un articulo con id "article-001" en mi organizacion
    Cuando envio una solicitud DELETE a "/api/knowledge/article-001"
    Entonces recibo una respuesta con codigo 200
    Y el cuerpo de la respuesta es:
      """
      {
        "message": "Articulo eliminado"
      }
      """
