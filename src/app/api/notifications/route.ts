import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  const orgId = request.headers.get("x-org-id");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(keepAlive);
        }
      }, 15000);

      const unsubscribe = globalThis.__notificationClients?.subscribe(userId || "", orgId || "", (event: string, data: string) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`));
        } catch {
          // client disconnected
        }
      });

      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        if (unsubscribe) unsubscribe();
        try { controller.close(); } catch { /* ignore */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
