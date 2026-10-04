// In-memory registry of open SSE connections, keyed by user id.
//
// This works for a single Node.js process — exactly what this project runs
// as (npm run dev / next start). It does NOT work across multiple server
// instances (e.g. serverless functions, multiple containers behind a load
// balancer) since each instance would have its own separate registry. A
// production deployment that scales horizontally would need a real pub/sub
// backend (Redis, Postgres LISTEN/NOTIFY) instead of this Map.

interface Client {
  userId: string;
  controller: ReadableStreamDefaultController<Uint8Array>;
}

const clients = new Set<Client>();
const encoder = new TextEncoder();

export function addClient(
  userId: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
) {
  const client: Client = { userId, controller };
  clients.add(client);
  return () => {
    clients.delete(client);
  };
}

export function sendToUser(userId: string, event: string, data: unknown) {
  const payload = encoder.encode(
    `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
  );

  for (const client of clients) {
    if (client.userId !== userId) continue;
    try {
      client.controller.enqueue(payload);
    } catch {
      clients.delete(client);
    }
  }
}
