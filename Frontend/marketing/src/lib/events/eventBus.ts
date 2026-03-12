type EventHandler = (data: unknown) => void;

const handlers: Map<string, EventHandler[]> = new Map();

export const eventBus = {
  on: (event: string, handler: EventHandler) => {
    if (!handlers.has(event)) {
      handlers.set(event, []);
    }
    handlers.get(event)!.push(handler);
  },
  off: (event: string, handler: EventHandler) => {
    const eventHandlers = handlers.get(event);
    if (eventHandlers) {
      const index = eventHandlers.indexOf(handler);
      if (index > -1) {
        eventHandlers.splice(index, 1);
      }
    }
  },
  emit: (event: string, data: unknown) => {
    const eventHandlers = handlers.get(event);
    if (eventHandlers) {
      eventHandlers.forEach(handler => handler(data));
    }
  },
};