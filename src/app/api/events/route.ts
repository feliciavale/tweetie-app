import { getCurrentUserId } from "@/lib/session";
import { addClient } from "@/lib/eventbus";

export const dynamic = "force-dynamic";

const KEEP_ALIVE_MS = 25000;

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  let cleanup: () => void = () => {};

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const removeClient = addClient(userId, controller);
      controller.enqueue(encoder.encode(`event: connected\ndata: {}\n\n`));

      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(keepAlive);
        }
      }, KEEP_ALIVE_MS);

      cleanup = () => {
        clearInterval(keepAlive);
        removeClient();
      };
    },
    cancel() {
      cleanup();
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
