interface NotificationClient {
  userId: string;
  orgId: string;
  callback: (event: string, data: string) => void;
}

const clients: NotificationClient[] = [];

export function subscribe(userId: string, orgId: string, callback: (event: string, data: string) => void) {
  const client: NotificationClient = { userId, orgId, callback };
  clients.push(client);
  return () => {
    const idx = clients.indexOf(client);
    if (idx >= 0) clients.splice(idx, 1);
  };
}

export function notify(event: string, data: string, userId?: string, orgId?: string) {
  const filtered = clients.filter((c) => {
    if (userId && c.userId !== userId) return false;
    if (orgId && c.orgId !== orgId) return false;
    return true;
  });
  filtered.forEach((c) => c.callback(event, data));
}

declare global {
  // eslint-disable-next-line no-var
  var __notificationClients: {
    subscribe: typeof subscribe;
    notify: typeof notify;
  } | undefined;
}

export function notifyTicketAssignment(ticketId: string, ticketNumber: number, title: string, assigneeId: string, orgId: string) {
  notify(
    "TICKET_ASSIGNED",
    JSON.stringify({
      id: ticketId,
      type: "TICKET_ASSIGNED",
      message: `Ticket TK-${ticketNumber} - "${title}" asignado a ti`,
      ticketId,
      timestamp: new Date().toISOString(),
    }),
    assigneeId,
    orgId
  );
}

export function notifyTicketUpdate(ticketId: string, ticketNumber: number, title: string, updateType: string, orgId: string, targetUserId?: string) {
  const labels: Record<string, string> = {
    STATUS_CHANGE: "cambio de estado",
    ASSIGNMENT: "asignacion",
    COMMENT: "nuevo comentario",
    PRIORITY_CHANGE: "cambio de prioridad",
  };
  notify(
    "TICKET_UPDATED",
    JSON.stringify({
      id: ticketId,
      type: "TICKET_UPDATED",
      message: `TK-${ticketNumber} - "${title}" - ${labels[updateType] || "actualizacion"}`,
      ticketId,
      timestamp: new Date().toISOString(),
    }),
    targetUserId,
    orgId
  );
}

if (!globalThis.__notificationClients) {
  globalThis.__notificationClients = { subscribe, notify };
}
