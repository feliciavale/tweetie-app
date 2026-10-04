"use client";

import { createContext, useContext, useEffect, useRef, ReactNode } from "react";

type EventHandler = (data: unknown) => void;

interface RealtimeContextValue {
  subscribe: (event: string, handler: EventHandler) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

const EVENT_NAMES = ["notification", "message"];

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const handlersRef = useRef<Map<string, Set<EventHandler>>>(new Map());

  useEffect(() => {
    const source = new EventSource("/api/events");

    const listeners = EVENT_NAMES.map((eventName) => {
      const listener = (event: MessageEvent) => {
        const handlers = handlersRef.current.get(eventName);
        if (!handlers || handlers.size === 0) return;

        let data: unknown = null;
        try {
          data = JSON.parse(event.data);
        } catch {
          data = null;
        }

        handlers.forEach((handler) => handler(data));
      };
      source.addEventListener(eventName, listener);
      return { eventName, listener };
    });

    return () => {
      listeners.forEach(({ eventName, listener }) =>
        source.removeEventListener(eventName, listener),
      );
      source.close();
    };
  }, []);

  function subscribe(event: string, handler: EventHandler) {
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    handlersRef.current.get(event)!.add(handler);

    return () => {
      handlersRef.current.get(event)?.delete(handler);
    };
  }

  return (
    <RealtimeContext.Provider value={{ subscribe }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return ctx;
}
