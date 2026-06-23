@auth
Funcionalidad: Autenticacion de usuarios

  Antecedentes:
    Dado que el sistema de autenticacion usa JWT con expiracion de 7 dias
    Y las cookies HttpOnly almacenan el token con nombre "token"

  Escenario: Registrar un nuevo usuario con organizacion
    Cuando envio una solicitud POST a "/api/auth/register"
    Y el cuerpo de la solicitud es:
      """
      {
        "orgName": "Tech Solutions SAC",
        "name": "Carlos Mendez",
        "email": "carlos@techsolutions.com",
        "password": "Segura123"
      }
      """
    Entonces recibo una respuesta con codigo 201
    Y el cuerpo de la respuesta contiene:
      """
      {
        "message": "Organizacion y usuario administrador creados correctamente"
      }
      """
    Y se crea una organizacion con slug "tech-solutions-sac"
    Y el usuario creado tiene rol "ADMIN"

  Escenario: Registrar usuario con datos invalidos devuelve 400
    Cuando envio una solicitud POST a "/api/auth/register"
    Y el cuerpo de la solicitud es:
      """
      {
        "orgName": "AB",
        "name": "",
        "email": "correo-invalido",
        "password": "123"
      }
      """
    Entonces recibo una respuesta con codigo 400
    Y el cuerpo de la respuesta contiene un campo "error" con valor "validation_error"

  Escenario: Registrar usuario con email duplicado en la misma organizacion devuelve 409
    Dado que existe un usuario con email "carlos@techsolutions.com" en la organizacion "tech-solutions-sac"
    Cuando envio una solicitud POST a "/api/auth/register"
    Y el cuerpo de la solicitud es:
      """
      {
        "orgName": "Tech Solutions SAC",
        "name": "Otro Usuario",
        "email": "carlos@techsolutions.com",
        "password": "Segura123"
      }
      """
    Entonces recibo una respuesta con codigo 409
    Y el cuerpo de la respuesta contiene un campo "error" con valor "conflict"
    Y el mensaje es "El email ya existe en esta organizacion"

  Escenario: Iniciar sesion con credenciales validas
    Dado que existe un usuario con email "admin@test.com" y password "Admin123"
    Cuando envio una solicitud POST a "/api/auth/login"
    Y el cuerpo de la solicitud es:
      """
      {
        "email": "admin@test.com",
        "password": "Admin123"
      }
      """
    Entonces recibo una respuesta con codigo 200
    Y el cuerpo de la respuesta tiene la estructura:
      """
      {
        "user": {
          "id": "string",
          "name": "string",
          "email": "string",
          "role": "string",
          "orgId": "string"
        }
      }
      """
    Y la respuesta incluye una cookie "token" con opcion HttpOnly
    Y la cookie tiene un maxAge de 604800 segundos

  Escenario: Iniciar sesion con contrasena incorrecta
    Dado que existe un usuario con email "admin@test.com" y password "Admin123"
    Cuando envio una solicitud POST a "/api/auth/login"
    Y el cuerpo de la solicitud es:
      """
      {
        "email": "admin@test.com",
        "password": "WrongPass99"
      }
      """
    Entonces recibo una respuesta con codigo 401
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "unauthorized",
        "message": "Credenciales invalidas"
      }
      """

  Escenario: Iniciar sesion con email inexistente
    Cuando envio una solicitud POST a "/api/auth/login"
    Y el cuerpo de la solicitud es:
      """
      {
        "email": "noexiste@test.com",
        "password": "Admin123"
      }
      """
    Entonces recibo una respuesta con codigo 401
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "unauthorized",
        "message": "Credenciales invalidas"
      }
      """

  Escenario: Cerrar sesion
    Dado que estoy autenticado con una sesion activa
    Cuando envio una solicitud POST a "/api/auth/logout"
    Entonces recibo una respuesta con codigo 200
    Y el cuerpo de la respuesta es:
      """
      {
        "message": "Sesion cerrada correctamente"
      }
      """
    Y la cookie "token" se elimina (maxAge: 0)

  Escenario: Acceder al dashboard sin autenticacion redirige al login
    Cuando realizo una solicitud GET a "/dashboard"
    Sin incluir la cookie "token"
    Entonces recibo una redireccion con codigo 307 a "/login"

  Escenario: Acceder a ruta protegida de API sin autenticacion devuelve 401
    Cuando realizo una solicitud GET a "/api/tickets"
    Sin incluir la cookie "token"
    Entonces recibo una respuesta con codigo 401
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "unauthorized",
        "message": "Token no proporcionado"
      }
      """

  Escenario: SUPER_ADMIN redirigido a /super-admin al entrar al dashboard
    Dado que estoy autenticado con rol "SUPER_ADMIN"
    Cuando realizo una solicitud GET a "/dashboard"
    Entonces recibo una redireccion a "/super-admin"

  Escenario: Token invalido o expirado en API devuelve 401
    Dado que tengo un token invalido "token_invalido"
    Cuando realizo una solicitud GET a "/api/tickets"
    Con la cookie "token" con valor "token_invalido"
    Entonces recibo una respuesta con codigo 401
    Y el cuerpo de la respuesta es:
      """
      {
        "error": "unauthorized",
        "message": "Token invalido o expirado"
      }
      """
