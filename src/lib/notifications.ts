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

if (!globalThis.__notificationClients) {
  globalThis.__notificationClients = { subscribe, notify };
}
