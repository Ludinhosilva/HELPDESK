import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando base de datos...");
  await prisma.ticketHistory.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.device.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creando usuarios...");
  const hashedPassword = await bcrypt.hash("123456", 12);

  const admin = await prisma.user.create({
    data: { email: "admin@taller.com", password: hashedPassword, name: "Administrador", role: "ADMIN", specialty: "Gestion" },
  });

  const tech1 = await prisma.user.create({
    data: { email: "carlos@taller.com", password: hashedPassword, name: "Carlos Lopez", role: "TECHNICIAN", specialty: "Hardware" },
  });

  const tech2 = await prisma.user.create({
    data: { email: "maria@taller.com", password: hashedPassword, name: "Maria Garcia", role: "TECHNICIAN", specialty: "Software" },
  });

  const tech3 = await prisma.user.create({
    data: { email: "pedro@taller.com", password: hashedPassword, name: "Pedro Mendez", role: "TECHNICIAN", specialty: "Electronica" },
  });

  console.log(`  Admin: ${admin.email}`);
  console.log(`  Tecnicos: ${tech1.name}, ${tech2.name}, ${tech3.name}`);

  console.log("Creando clientes...");
  const c1 = await prisma.customer.create({ data: { name: "Roberto Angulo", phone: "987654321", email: "roberto@gmail.com" } });
  const c2 = await prisma.customer.create({ data: { name: "Lucia Fernandez", phone: "999888777", email: "lucia@outlook.com" } });
  const c3 = await prisma.customer.create({ data: { name: "Empresa Comercial SAC", phone: "945123789" } });
  const c4 = await prisma.customer.create({ data: { name: "Jorge Castillo", phone: "978456123", email: "jorge.castillo@hotmail.com" } });
  const c5 = await prisma.customer.create({ data: { name: "Colegio San Martin", phone: "963852741" } });
  const c6 = await prisma.customer.create({ data: { name: "Ana Maria Torres", phone: "991234567", email: "ana.torres@gmail.com" } });

  console.log(`  ${[c1, c2, c3, c4, c5, c6].length} clientes creados`);

  console.log("Creando equipos...");
  const d1 = await prisma.device.create({ data: { brand: "Dell", model: "Latitude 5520", serial: "DL5520-001", type: "LAPTOP", accessories: "Cargador original", customerId: c1.id } });
  const d2 = await prisma.device.create({ data: { brand: "HP", model: "Pavilion x360", serial: "HP360-8822", type: "LAPTOP", accessories: "Cargador, mochila", customerId: c2.id } });
  const d3 = await prisma.device.create({ data: { brand: "Lenovo", model: "ThinkCentre M720", serial: "LTC720-334", type: "DESKTOP", accessories: "Teclado, mouse", customerId: c3.id } });
  const d4 = await prisma.device.create({ data: { brand: "Dell", model: "OptiPlex 3080", serial: "DL3080-556", type: "DESKTOP", customerId: c3.id } });
  const d5 = await prisma.device.create({ data: { brand: "Asus", model: "Vivobook 15", serial: "ASUS15-991", type: "LAPTOP", customerId: c4.id } });
  const d6 = await prisma.device.create({ data: { brand: "Apple", model: "iMac 24 2023", serial: "IMAC24-772", type: "ALL_IN_ONE", accessories: "Teclado Magic, Magic Mouse", customerId: c5.id } });
  const d7 = await prisma.device.create({ data: { brand: "HP", model: "EliteBook 840", serial: "HP840-445", type: "LAPTOP", accessories: "Cargador USB-C", customerId: c5.id } });
  const d8 = await prisma.device.create({ data: { brand: "Acer", model: "Aspire 5", serial: "ACER5-223", type: "LAPTOP", customerId: c6.id } });
  const d9 = await prisma.device.create({ data: { brand: "Samsung", model: "Galaxy Tab S9", serial: "SGT9-881", type: "TABLET", accessories: "S Pen, funda", customerId: c6.id } });
  const d10 = await prisma.device.create({ data: { brand: "Lenovo", model: "IdeaPad 3", serial: "LIP3-667", type: "LAPTOP", customerId: c1.id } });

  console.log(`  ${[d1, d2, d3, d4, d5, d6, d7, d8, d9, d10].length} equipos creados`);

  console.log("Creando tickets en diferentes estados...");

  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  // --- RECEIVED (recien ingresados) ---
  const tk1 = await prisma.ticket.create({
    data: {
      ticketNumber: 1, description: "No enciende. El LED del cargador no prende. El cliente menciona que olia a quemado.",
      status: "RECEIVED", priority: "HIGH", cost: 0, customerId: c1.id, deviceId: d1.id,
      createdAt: daysAgo(0),
      history: { create: { action: "CREATED", description: "Ticket TK-1 creado. Equipo ingresado con cargador original." } },
    },
  });

  const tk2 = await prisma.ticket.create({
    data: {
      ticketNumber: 2, description: "Pantalla parpadea constantemente. A veces se queda en negro por varios segundos.",
      status: "RECEIVED", priority: "MEDIUM", cost: 0, customerId: c6.id, deviceId: d8.id,
      createdAt: daysAgo(0),
      history: { create: { action: "CREATED", description: "Ticket TK-2 creado." } },
    },
  });

  // --- DIAGNOSING ---
  const tk3 = await prisma.ticket.create({
    data: {
      ticketNumber: 3, description: "Lentitud extrema al abrir programas. Sospecha de disco duro dañado.",
      status: "DIAGNOSING", priority: "MEDIUM", cost: 0, technicianId: tech2.id,
      customerId: c3.id, deviceId: d3.id,
      createdAt: daysAgo(1),
      history: {
        create: [
          { action: "CREATED", description: "Ticket TK-3 creado." },
          { action: "STATUS_CHANGE", description: "Estado cambiado de RECEIVED a DIAGNOSING" },
          { action: "ASSIGNMENT", description: "Asignado a Maria Garcia" },
        ],
      },
    },
  });

  const tk4 = await prisma.ticket.create({
    data: {
      ticketNumber: 4, description: "Teclas no responden (W, A, S, D). Posible derrame de liquido.",
      status: "DIAGNOSING", priority: "HIGH", cost: 0, technicianId: tech1.id,
      customerId: c2.id, deviceId: d2.id,
      createdAt: daysAgo(1),
      history: {
        create: [
          { action: "CREATED", description: "Ticket TK-4 creado. Equipo ingresado con cargador y mochila." },
          { action: "STATUS_CHANGE", description: "Estado cambiado de RECEIVED a DIAGNOSING" },
          { action: "ASSIGNMENT", description: "Asignado a Carlos Lopez" },
        ],
      },
    },
  });

  // --- REPAIRING ---
  const tk5 = await prisma.ticket.create({
    data: {
      ticketNumber: 5, description: "No detecta disco duro. BIOS no muestra el SSD NVMe.",
      status: "REPAIRING", priority: "CRITICAL", cost: 15000, technicianId: tech1.id,
      notes: "Se reemplazara el SSD NVMe por uno nuevo de 512GB.",
      customerId: c4.id, deviceId: d5.id,
      createdAt: daysAgo(3),
      history: {
        create: [
          { action: "CREATED", description: "Ticket TK-5 creado." },
          { action: "STATUS_CHANGE", description: "Estado cambiado de RECEIVED a DIAGNOSING" },
          { action: "ASSIGNMENT", description: "Asignado a Carlos Lopez" },
          { action: "STATUS_CHANGE", description: "Estado cambiado de DIAGNOSING a REPAIRING" },
          { action: "NOTE", description: "Diagnostico: SSD NVMe fallado. Sector de arranque corrupto." },
        ],
      },
    },
  });

  const tk6 = await prisma.ticket.create({
    data: {
      ticketNumber: 6, description: "Sobrecalentamiento. Ventilador gira al maximo constantemente.",
      status: "REPAIRING", priority: "MEDIUM", cost: 5000, technicianId: tech3.id,
      notes: "Se realizara limpieza interna y cambio de pasta termica.",
      customerId: c5.id, deviceId: d6.id,
      createdAt: daysAgo(2),
      history: {
        create: [
          { action: "CREATED", description: "Ticket TK-6 creado." },
          { action: "STATUS_CHANGE", description: "Estado cambiado de RECEIVED a DIAGNOSING" },
          { action: "ASSIGNMENT", description: "Asignado a Pedro Mendez" },
          { action: "STATUS_CHANGE", description: "Estado cambiado de DIAGNOSING a REPAIRING" },
        ],
      },
    },
  });

  // --- WAITING_PARTS ---
  const tk7 = await prisma.ticket.create({
    data: {
      ticketNumber: 7, description: "Pantalla rota. Se necesita reemplazar el panel LCD 15.6 pulgadas.",
      status: "WAITING_PARTS", priority: "HIGH", cost: 35000, technicianId: tech1.id,
      notes: "Repuesto pedido: Panel LCD 15.6 FHD IPS. Llegada estimada: 3 dias.",
      customerId: c5.id, deviceId: d7.id,
      createdAt: daysAgo(5),
      history: {
        create: [
          { action: "CREATED", description: "Ticket TK-7 creado." },
          { action: "STATUS_CHANGE", description: "Estado cambiado de RECEIVED a DIAGNOSING" },
          { action: "ASSIGNMENT", description: "Asignado a Carlos Lopez" },
          { action: "STATUS_CHANGE", description: "Estado cambiado de DIAGNOSING a REPAIRING" },
          { action: "STATUS_CHANGE", description: "Estado cambiado de REPAIRING a WAITING_PARTS" },
          { action: "NOTE", description: "Repuesto solicitado a proveedor. Panel LCD 15.6 FHD IPS $350" },
        ],
      },
    },
  });

  const tk8 = await prisma.ticket.create({
    data: {
      ticketNumber: 8, description: "Bateria no carga. Solo funciona conectado a corriente.",
      status: "WAITING_PARTS", priority: "MEDIUM", cost: 12000, technicianId: tech3.id,
      notes: "Repuesto pedido: Bateria original Dell de 4 celdas.",
      customerId: c1.id, deviceId: d10.id,
      createdAt: daysAgo(4),
      history: {
        create: [
          { action: "CREATED", description: "Ticket TK-8 creado." },
          { action: "STATUS_CHANGE", description: "Estado cambiado de RECEIVED a DIAGNOSING" },
          { action: "ASSIGNMENT", description: "Asignado a Pedro Mendez" },
          { action: "STATUS_CHANGE", description: "Estado cambiado de DIAGNOSING a WAITING_PARTS" },
        ],
      },
    },
  });

  // --- READY (listo para entregar) ---
  const tk9 = await prisma.ticket.create({
    data: {
      ticketNumber: 9, description: "Formateo e instalacion de Windows 11 + Office 2021.",
      status: "READY", priority: "LOW", cost: 8000, technicianId: tech2.id,
      notes: "Instalacion completada. Se realizo respaldo de datos del usuario antes del formateo.",
      customerId: c6.id, deviceId: d9.id,
      createdAt: daysAgo(3),
      history: {
        create: [
          { action: "CREATED", description: "Ticket TK-9 creado." },
          { action: "STATUS_CHANGE", description: "Estado cambiado de RECEIVED a DIAGNOSING" },
          { action: "ASSIGNMENT", description: "Asignado a Maria Garcia" },
          { action: "STATUS_CHANGE", description: "Estado cambiado de DIAGNOSING a REPAIRING" },
          { action: "STATUS_CHANGE", description: "Estado cambiado de REPAIRING a READY" },
          { action: "NOTE", description: "Equipo probado. Todos los drivers instalados. Windows activado." },
        ],
      },
    },
  });

  const tk10 = await prisma.ticket.create({
    data: {
      ticketNumber: 10, description: "Reemplazo de teclado dañado por derrame de cafe.",
      status: "READY", priority: "HIGH", cost: 9000, technicianId: tech1.id,
      notes: "Teclado reemplazado. Se limpio placa base para evitar corrosion futura.",
      customerId: c2.id, deviceId: d2.id,
      createdAt: daysAgo(6),
      history: {
        create: [
          { action: "CREATED", description: "Ticket TK-10 creado." },
          { action: "STATUS_CHANGE", description: "Estado cambiado de RECEIVED a DIAGNOSING" },
          { action: "ASSIGNMENT", description: "Asignado a Carlos Lopez" },
          { action: "STATUS_CHANGE", description: "Estado cambiado de DIAGNOSING a REPAIRING" },
          { action: "STATUS_CHANGE", description: "Estado cambiado de REPAIRING a READY" },
        ],
      },
    },
  });

  // --- DELIVERED (entregados) ---
  const tk11 = await prisma.ticket.create({
    data: {
      ticketNumber: 11, description: "Equipo no detectaba RAM instalada. Se reemplazo modulo DDR4 8GB.",
      status: "DELIVERED", priority: "MEDIUM", cost: 12000, technicianId: tech1.id,
      notes: "Cliente recogio equipo. Todo funcionando correctamente.",
      customerId: c3.id, deviceId: d4.id,
      createdAt: daysAgo(10),
      updatedAt: daysAgo(2),
      history: {
        create: [
          { action: "CREATED", description: "Ticket TK-11 creado." },
          { action: "STATUS_CHANGE", description: "Estado cambiado de RECEIVED a DIAGNOSING" },
          { action: "ASSIGNMENT", description: "Asignado a Carlos Lopez" },
          { action: "STATUS_CHANGE", description: "Estado cambiado de DIAGNOSING a REPAIRING" },
          { action: "STATUS_CHANGE", description: "Estado cambiado de REPAIRING a READY" },
          { action: "STATUS_CHANGE", description: "Estado cambiado de READY a DELIVERED" },
          { action: "NOTE", description: "Entregado al cliente. Pago recepcionado S/ 120.00 en efectivo." },
        ],
      },
    },
  });

  const tk12 = await prisma.ticket.create({
    data: {
      ticketNumber: 12, description: "Respaldo de datos y migracion a nueva laptop.",
      status: "DELIVERED", priority: "LOW", cost: 5000, technicianId: tech2.id,
      notes: "Datos migrados exitosamente a nuevo equipo Dell XPS 15.",
      customerId: c4.id, deviceId: d5.id,
      createdAt: daysAgo(15),
      updatedAt: daysAgo(5),
      history: {
        create: [
          { action: "CREATED", description: "Ticket TK-12 creado." },
          { action: "STATUS_CHANGE", description: "Estado cambiado de RECEIVED a DIAGNOSING" },
          { action: "ASSIGNMENT", description: "Asignado a Maria Garcia" },
          { action: "STATUS_CHANGE", description: "Estado cambiado de DIAGNOSING a REPAIRING" },
          { action: "STATUS_CHANGE", description: "Estado cambiado de REPAIRING a READY" },
          { action: "STATUS_CHANGE", description: "Estado cambiado de READY a DELIVERED" },
        ],
      },
    },
  });

  console.log(`  ${[tk1, tk2, tk3, tk4, tk5, tk6, tk7, tk8, tk9, tk10, tk11, tk12].length} tickets creados`);
  console.log("---");
  console.log("Resumen de tickets:");
  console.log("  RECEIVED:     TK-1 (No enciende), TK-2 (Pantalla parpadea)");
  console.log("  DIAGNOSING:   TK-3 (Lentitud), TK-4 (Teclas no responden)");
  console.log("  REPAIRING:    TK-5 (SSD fallado), TK-6 (Sobrecalentamiento)");
  console.log("  WAITING:      TK-7 (Pantalla rota), TK-8 (Bateria no carga)");
  console.log("  READY:        TK-9 (Formateo), TK-10 (Teclado reemplazado)");
  console.log("  DELIVERED:    TK-11 (RAM), TK-12 (Migracion datos)");
  console.log("---");
  console.log("Credenciales:");
  console.log("  admin@taller.com / 123456 (ADMIN)");
  console.log("  carlos@taller.com / 123456 (TECHNICIAN - Hardware)");
  console.log("  maria@taller.com / 123456 (TECHNICIAN - Software)");
  console.log("  pedro@taller.com / 123456 (TECHNICIAN - Electronica)");
  console.log("---");
  console.log("Seed completado exitosamente!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
