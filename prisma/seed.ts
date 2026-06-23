import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando base de datos...");
  await prisma.emailLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.knowledgeArticle.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.ticketHistory.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const hashedPassword = await bcrypt.hash("admin123", 12);

  console.log("Creando planes de suscripcion...");
  const planFree = await prisma.subscriptionPlan.create({
    data: {
      name: "Gratis", slug: "free", price: 0, ticketLimit: 50,
      features: JSON.stringify(["50 tickets/mes", "Dashboard basico", "Base de conocimiento", "1 chat con IA gratis"]),
      isPopular: false,
    },
  });
  const planBasico = await prisma.subscriptionPlan.create({
    data: {
      name: "Basico", slug: "basico", price: 2900, ticketLimit: null,
      features: JSON.stringify(["Tickets ilimitados", "IA ilimitada", "Analytics basico", "Notificaciones por correo", "Soporte por correo"]),
      isPopular: false,
    },
  });
  const planPro = await prisma.subscriptionPlan.create({
    data: {
      name: "Pro", slug: "pro", price: 7900, ticketLimit: null,
      features: JSON.stringify(["Todo del plan Basico", "IA clasificacion automatica", "Sugerencias de solucion", "Analytics avanzado", "Soporte prioritario"]),
      isPopular: true,
    },
  });

  console.log("Creando super administrador global...");
  const superAdmin = await prisma.user.create({
    data: { email: "super@flixsupport.com", password: hashedPassword, name: "Super Administrador", role: "SUPER_ADMIN" },
  });

  console.log("Creando organizacion 1: TechCorp...");
  const org1 = await prisma.organization.create({
    data: { name: "TechCorp S.A.C.", slug: "techcorp" },
  });

  const admin1 = await prisma.user.create({
    data: { email: "admin@techcorp.com", password: hashedPassword, name: "Danny Ordoñez", role: "ADMIN", organizationId: org1.id },
  });
  const tech1 = await prisma.user.create({
    data: { email: "ludwing@techcorp.com", password: hashedPassword, name: "Ludwing Silva", role: "TECHNICIAN", organizationId: org1.id },
  });
  const tech2 = await prisma.user.create({
    data: { email: "jhor@techcorp.com", password: hashedPassword, name: "Jhor Grandez", role: "TECHNICIAN", organizationId: org1.id },
  });
  const user1 = await prisma.user.create({
    data: { email: "alex@techcorp.com", password: hashedPassword, name: "Alexander Paredes", role: "END_USER", organizationId: org1.id },
  });
  const user2 = await prisma.user.create({
    data: { email: "andre@techcorp.com", password: hashedPassword, name: "Andre Burga", role: "END_USER", organizationId: org1.id },
  });

  console.log("Creando organizacion 2: InnovaSoft...");
  const org2 = await prisma.organization.create({
    data: { name: "InnovaSoft E.I.R.L.", slug: "innovasoft" },
  });
  const admin2 = await prisma.user.create({
    data: { email: "admin@innovasoft.com", password: hashedPassword, name: "Renzo Bereca", role: "ADMIN", organizationId: org2.id },
  });

  console.log("Creando categorias...");
  const cat1 = await prisma.category.create({ data: { name: "Hardware", slug: "hardware", organizationId: org1.id } });
  const cat2 = await prisma.category.create({ data: { name: "Software", slug: "software", organizationId: org1.id } });
  const cat3 = await prisma.category.create({ data: { name: "Red", slug: "red", organizationId: org1.id } });
  const cat4 = await prisma.category.create({ data: { name: "Accesos", slug: "accesos", organizationId: org1.id } });
  const cat5 = await prisma.category.create({ data: { name: "Otros", slug: "otros", organizationId: org1.id } });

  await prisma.category.create({ data: { name: "Hardware", slug: "hardware", organizationId: org2.id } });
  await prisma.category.create({ data: { name: "Software", slug: "software", organizationId: org2.id } });

  console.log("Creando suscripcion...");
  await prisma.subscription.create({
    data: {
      status: "ACTIVE", organizationId: org1.id, planId: planPro.id,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      payments: {
        create: { amount: 7900, status: "SUCCESS", reference: "CULQI-001" },
      },
    },
  });

  console.log("Creando tickets...");
  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  const tk1 = await prisma.ticket.create({
    data: {
      ticketNumber: 1, title: "No enciende la laptop Dell",
      description: "La laptop Dell Latitude no enciende. El LED del cargador no prende. El cliente menciona que olia a quemado.",
      status: "OPEN", priority: "HIGH", organizationId: org1.id, categoryId: cat1.id, createdById: user1.id,
      createdAt: daysAgo(2),
      history: { create: [{ action: "CREATED", description: "Ticket #1 creado por Alexander Paredes" }] },
    },
  });

  const tk2 = await prisma.ticket.create({
    data: {
      ticketNumber: 2, title: "Pantalla parpadea constantemente",
      description: "La pantalla del laptop HP Pavilion parpadea constantemente. A veces se queda en negro por varios segundos.",
      status: "IN_PROGRESS", priority: "MEDIUM", organizationId: org1.id, categoryId: cat1.id,
      createdById: user2.id, assignedToId: tech1.id,
      createdAt: daysAgo(3),
      history: {
        create: [
          { action: "CREATED", description: "Ticket #2 creado por Andre Burga" },
          { action: "ASSIGNED", description: "Asignado a Ludwing Silva" },
          { action: "STATUS_CHANGE", description: "Estado cambiado de OPEN a IN_PROGRESS" },
        ],
      },
    },
  });

  const tk3 = await prisma.ticket.create({
    data: {
      ticketNumber: 3, title: "No funciona el correo electronico",
      description: "No puedo enviar ni recibir correos desde Outlook. Me marca error de conexion al servidor SMTP.",
      status: "ON_HOLD", priority: "MEDIUM", organizationId: org1.id, categoryId: cat4.id,
      createdById: user1.id, assignedToId: tech2.id,
      createdAt: daysAgo(5),
      history: {
        create: [
          { action: "CREATED", description: "Ticket #3 creado" },
          { action: "ASSIGNED", description: "Asignado a Jhor Grandez" },
          { action: "STATUS_CHANGE", description: "Estado cambiado a ON_HOLD - Esperando configuracion del servidor" },
        ],
      },
    },
  });

  const tk4 = await prisma.ticket.create({
    data: {
      ticketNumber: 4, title: "Instalar Office 2021 en 5 equipos",
      description: "Se necesita instalar Microsoft Office 2021 en 5 laptops nuevas para el equipo de contabilidad.",
      status: "RESOLVED", priority: "LOW", organizationId: org1.id, categoryId: cat2.id,
      createdById: user2.id, assignedToId: tech1.id, resolvedAt: daysAgo(1),
      createdAt: daysAgo(7),
      history: {
        create: [
          { action: "CREATED", description: "Ticket #4 creado" },
          { action: "ASSIGNED", description: "Asignado a Ludwing Silva" },
          { action: "STATUS_CHANGE", description: "Estado cambiado a IN_PROGRESS" },
          { action: "STATUS_CHANGE", description: "Estado cambiado a RESOLVED" },
        ],
      },
    },
  });

  const tk5 = await prisma.ticket.create({
    data: {
      ticketNumber: 5, title: "Internet lento en piso 3",
      description: "El internet del piso 3 esta extremadamente lento. Velocidad de descarga menor a 1 Mbps.",
      status: "OPEN", priority: "URGENT", organizationId: org1.id, categoryId: cat3.id,
      createdById: user1.id,
      createdAt: daysAgo(0),
      history: { create: [{ action: "CREATED", description: "Ticket #5 creado - URGENTE" }] },
    },
  });

  const tk6 = await prisma.ticket.create({
    data: {
      ticketNumber: 6, title: "Formateo de laptop ASUS",
      description: "Laptop ASUS Vivobook muy lenta, necesita formateo completo e instalacion de Windows 11.",
      status: "CLOSED", priority: "MEDIUM", organizationId: org1.id, categoryId: cat2.id,
      createdById: user2.id, assignedToId: tech2.id, resolvedAt: daysAgo(3), closedAt: daysAgo(2),
      createdAt: daysAgo(10),
      history: {
        create: [
          { action: "CREATED", description: "Ticket #6 creado" },
          { action: "ASSIGNED", description: "Asignado a Jhor Grandez" },
          { action: "STATUS_CHANGE", description: "Estado cambiado a IN_PROGRESS" },
          { action: "STATUS_CHANGE", description: "Estado cambiado a RESOLVED" },
          { action: "STATUS_CHANGE", description: "Estado cambiado a CLOSED" },
        ],
      },
    },
  });

  const tk7 = await prisma.ticket.create({
    data: {
      ticketNumber: 7, title: "Impresora no responde",
      description: "La impresora HP LaserJet del area de administracion no responde a solicitudes de impresion.",
      status: "IN_PROGRESS", priority: "HIGH", organizationId: org1.id, categoryId: cat1.id,
      createdById: user1.id, assignedToId: tech1.id,
      createdAt: daysAgo(1),
      history: {
        create: [
          { action: "CREATED", description: "Ticket #7 creado" },
          { action: "ASSIGNED", description: "Asignado a Ludwing Silva" },
          { action: "STATUS_CHANGE", description: "Estado cambiado a IN_PROGRESS" },
        ],
      },
    },
  });

  const tk8 = await prisma.ticket.create({
    data: {
      ticketNumber: 8, title: "Acceso denegado a carpeta compartida",
      description: "Los usuarios del departamento de ventas no pueden acceder a la carpeta compartida en el servidor.",
      status: "OPEN", priority: "HIGH", organizationId: org1.id, categoryId: cat4.id,
      createdById: user2.id,
      createdAt: daysAgo(0),
      history: { create: [{ action: "CREATED", description: "Ticket #8 creado" }] },
    },
  });

  console.log("Creando evaluaciones...");
  await prisma.evaluation.create({
    data: { rating: 5, comment: "Excelente trabajo, rapido y profesional.", ticketId: tk4.id, userId: user2.id },
  });
  await prisma.evaluation.create({
    data: { rating: 4, comment: "Buen servicio, tardó un poco pero quedo bien.", ticketId: tk6.id, userId: user2.id },
  });

  console.log("Creando articulos de base de conocimiento...");
  await prisma.knowledgeArticle.create({
    data: {
      title: "Como reiniciar la impresora HP", slug: "reiniciar-impresora-hp",
      content: "1. Apague la impresora presionando el boton de encendido.\n2. Espere 30 segundos.\n3. Desconecte el cable de corriente.\n4. Espere 1 minuto.\n5. Reconecte y encienda.\n6. Si persiste el problema, verifique el cable USB o la conexion de red.",
      status: "PUBLISHED", organizationId: org1.id, categoryId: cat1.id, viewCount: 24, helpfulCount: 18,
    },
  });
  await prisma.knowledgeArticle.create({
    data: {
      title: "Configuracion de correo en Outlook", slug: "config-outlook",
      content: "1. Abra Outlook y vaya a Archivo > Configuracion de cuenta.\n2. Haga clic en Nuevo.\n3. Ingrese su correo electronico.\n4. Ingrese la contraseña proporcionada por TI.\n5. Outlook detectara la configuracion automaticamente.\n6. Haga clic en Finalizar.",
      status: "PUBLISHED", organizationId: org1.id, categoryId: cat4.id, viewCount: 45, helpfulCount: 32,
    },
  });
  await prisma.knowledgeArticle.create({
    data: {
      title: "Solucion a internet lento", slug: "internet-lento",
      content: "1. Reinicie el router desconnectandolo por 30 segundos.\n2. Verifique que no haya descargas pesadas en curso.\n3. Compruebe la velocidad en speedtest.net.\n4. Si el problema persiste, contacte al area de TI para revisar el switch del piso.",
      status: "PUBLISHED", organizationId: org1.id, categoryId: cat3.id, viewCount: 67, helpfulCount: 41,
    },
  });
  await prisma.knowledgeArticle.create({
    data: {
      title: "Borrador: Politica de uso de TI", slug: "politica-uso-ti",
      content: "Este articulo esta en borrador. Pendiente de aprobacion por el administrador.",
      status: "DRAFT", organizationId: org1.id, categoryId: cat5.id,
    },
  });

  console.log("Creando logs de email...");
  await prisma.emailLog.create({
    data: { to: "alex@techcorp.com", subject: "Ticket #1 creado", body: "Su ticket ha sido registrado exitosamente.", type: "TICKET_CREATED", organizationId: org1.id, ticketId: tk1.id },
  });
  await prisma.emailLog.create({
    data: { to: "ludwing@techcorp.com", subject: "Ticket #2 asignado", body: "Se le ha asignado el ticket #2.", type: "TICKET_ASSIGNED", organizationId: org1.id, ticketId: tk2.id },
  });

  console.log("---");
  console.log("Resumen:");
  console.log("  Org 1: TechCorp S.A.C. (slug: techcorp)");
  console.log("  Org 2: InnovaSoft E.I.R.L. (slug: innovasoft)");
  console.log("  8 tickets creados en diferentes estados");
  console.log("  3 articulos de KB (2 publicados, 1 borrador)");
  console.log("  2 evaluaciones");
  console.log("---");
  console.log("Credenciales:");
  console.log("  super@flixsupport.com / admin123 (SUPER_ADMIN - Global)");
  console.log("  admin@techcorp.com / admin123 (ADMIN - TechCorp)");
  console.log("  ludwing@techcorp.com / admin123 (TECHNICIAN - TechCorp)");
  console.log("  jhor@techcorp.com / admin123 (TECHNICIAN - TechCorp)");
  console.log("  alex@techcorp.com / admin123 (END_USER - TechCorp)");
  console.log("  andre@techcorp.com / admin123 (END_USER - TechCorp)");
  console.log("  admin@innovasoft.com / admin123 (ADMIN - InnovaSoft)");
  console.log("---");
  console.log("Seed completado!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
