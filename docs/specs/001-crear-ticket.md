# Feature: Crear Ticket de Reparacion

> **Spec ID**: SPEC-001
> **Autor**: Arquitecto IA
> **Estado**: Aprobado
> **Modulo**: Tickets

---

## Descripcion

El recepcionista (ADMIN) o tecnico (TECHNICIAN) registra el ingreso de un equipo al taller creando una orden de servicio (ticket). El sistema genera automaticamente un numero de ticket secuencial, registra fecha/hora de ingreso, y deja constancia en el historial de auditoria.

---

## Reglas de Negocio Aplicables

- **RB-005**: Al crear un ticket, se genera automaticamente una entrada en TicketHistory con accion CREATED
- **RB-006**: El costo se almacena en centavos
- El ticket se crea siempre con status RECEIVED
- El ticketNumber es autoincremental y unico

---

## Casos de Uso

### Caso 1: Creacion Exitosa (Happy Path)

```
Feature: Crear Ticket de Reparacion

  Background:
    Given un cliente "Juan Perez" con telefono "999888777" existe en el sistema
    And un equipo marca "Dell" modelo "Latitude 5520" serie "DL5520-001" tipo LAPTOP
      con accesorios "Cargador original, mochila" existe para el cliente

  Scenario: Recepcionista crea un ticket de reparacion exitosamente
    Given el usuario autenticado tiene rol ADMIN
    When envia POST /api/tickets con:
      | customerId  | <id de Juan Perez>           |
      | deviceId    | <id de Dell Latitude 5520>   |
      | description | "No enciende. El LED de carga no prende." |
      | priority    | HIGH                         |
    Then el sistema responde con status 201
    And el body contiene:
      | ticketNumber | autoincremental (ej: 1) |
      | status       | RECEIVED                |
      | description  | "No enciende. El LED de carga no prende." |
      | priority     | HIGH                    |
      | cost         | 0                       |
      | customer.name | "Juan Perez"           |
      | device.brand  | "Dell"                 |
    And se crea una entrada en TicketHistory con:
      | action      | CREATED                          |
      | description | "Ticket TK-1 creado"             |
```

### Caso 2: Validacion de Campos Requeridos

```
  Scenario: Faltan campos obligatorios
    Given el usuario autenticado tiene rol ADMIN
    When envia POST /api/tickets sin description
    Then el sistema responde con status 400
    And el body contiene:
      | error   | "validation_error"                  |
      | message | "La descripcion es requerida"       |
```

### Caso 3: Device No Encontrado

```
  Scenario: El deviceId no existe en el sistema
    Given el usuario autenticado tiene rol ADMIN
    When envia POST /api/tickets con:
      | customerId  | <id valido>                        |
      | deviceId    | "uuid-inexistente"                 |
      | description | "Pantalla rota"                     |
    Then el sistema responde con status 404
    And el body contiene:
      | error   | "not_found"                  |
      | message | "El equipo no existe"        |
```

### Caso 4: Customer No Encontrado

```
  Scenario: El customerId no existe en el sistema
    Given el usuario autenticado tiene rol ADMIN
    When envia POST /api/tickets con:
      | customerId  | "uuid-inexistente"                 |
      | deviceId    | <id valido>                         |
      | description | "Teclado no funciona"               |
    Then el sistema responde con status 404
    And el body contiene:
      | error   | "not_found"                  |
      | message | "El cliente no existe"       |
```

### Caso 5: Device No Pertenece al Customer

```
  Scenario: El device pertenece a otro cliente
    Given el cliente "Juan Perez" existe
    And el cliente "Maria Gomez" existe
    And un equipo "HP Pavilion" pertenece a "Maria Gomez"
    When se intenta crear un ticket con customerId de "Juan Perez"
      y deviceId de "HP Pavilion"
    Then el sistema responde con status 400
    And el body contiene:
      | error   | "validation_error"                              |
      | message | "El equipo no pertenece al cliente especificado" |
```

### Caso 6: Prioridad Invalida

```
  Scenario: Se envia una prioridad que no existe en el enum
    Given el usuario autenticado tiene rol ADMIN
    When envia POST /api/tickets con priority = "URGENTE"
    Then el sistema responde con status 400
    And el body contiene:
      | error   | "validation_error"                           |
      | message | "Prioridad invalida. Valores: LOW, MEDIUM, HIGH, CRITICAL" |
```

### Caso 7: Usuario No Autenticado

```
  Scenario: Usuario sin sesion intenta crear ticket
    Given no hay token JWT en la peticion
    When envia POST /api/tickets
    Then el sistema responde con status 401
    And el body contiene:
      | error   | "unauthorized"               |
      | message | "Token no proporcionado"     |
```

---

## Casos de Seguridad (Caja Blanca)

### Caso 8: SQL Injection en description

```
  Scenario: El sistema sanitiza entradas contra SQL Injection
    Given el usuario autenticado tiene rol ADMIN
    When envia POST /api/tickets con:
      | description | "'; DROP TABLE tickets; --" |
    Then el sistema responde con status 201
    And el ticket se crea con la descripcion literal
      "'; DROP TABLE tickets; --" (sin ejecutar SQL)
    And la tabla tickets sigue existiendo en la base de datos
```

### Caso 9: XSS en description

```
  Scenario: El sistema escapa HTML en la descripcion
    Given el usuario autenticado tiene rol ADMIN
    When envia POST /api/tickets con:
      | description | "<script>alert('hack')</script>" |
    Then el sistema responde con status 201
    And en la respuesta el campo description contiene el texto literal
      sin que se ejecute como HTML
```

### Caso 10: SQL Injection en campos numericos

```
  Scenario: El sistema rechaza valores no numericos en campos Int
    Given el usuario autenticado tiene rol ADMIN
    When envia POST /api/tickets con cost = "0; DELETE FROM users; --"
    Then el sistema responde con status 400
    And el body contiene:
      | error   | "validation_error"         |
      | message | "El costo debe ser un numero entero" |
```

---

## Esquema de Request/Response

### POST /api/tickets

**Request Body:**
```json
{
  "customerId": "uuid",
  "deviceId": "uuid",
  "description": "string (required, max 500 chars)",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL (default: MEDIUM)",
  "cost": 0,
  "notes": "string (optional)"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "ticketNumber": 1,
  "description": "No enciende",
  "status": "RECEIVED",
  "priority": "HIGH",
  "cost": 0,
  "notes": null,
  "customer": {
    "id": "uuid",
    "name": "Juan Perez",
    "phone": "999888777"
  },
  "device": {
    "id": "uuid",
    "brand": "Dell",
    "model": "Latitude 5520",
    "serial": "DL5520-001",
    "type": "LAPTOP"
  },
  "technician": null,
  "createdAt": "2026-05-25T12:00:00.000Z"
}
```

**Response 400:**
```json
{
  "error": "validation_error",
  "message": "La descripcion es requerida"
}
```

---

## Criterios de Aceptacion

- [ ] Un ADMIN o TECHNICIAN autenticado puede crear un ticket
- [ ] El ticket se crea con status RECEIVED automaticamente
- [ ] El ticketNumber se genera autoincremental
- [ ] Se valida que customerId y deviceId existan
- [ ] Se valida que el device pertenezca al customer
- [ ] La descripcion es requerida (max 500 caracteres)
- [ ] La prioridad debe ser un valor del enum Priority
- [ ] El costo se almacena como entero (centavos)
- [ ] Se registra entrada en TicketHistory con accion CREATED
- [ ] Entradas sanitizadas contra SQL Injection y XSS
- [ ] Usuario no autenticado recibe 401
