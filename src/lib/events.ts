type Listener = (data: { timestamp: string; event: string }) => void;

class EventBroadcaster {
  private listeners: Set<Listener> = new Set();
  private lastVersion: string = new Date().toISOString();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  broadcast(event: string = 'results-updated'): void {
    this.lastVersion = new Date().toISOString();
    const payload = { timestamp: this.lastVersion, event };
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch {
        // Listener disconnected
      }
    });
  }

  getVersion(): string {
    return this.lastVersion;
  }
}

// Global singleton across hot-reloads
const globalForEvents = globalThis as unknown as { eventBroadcaster?: EventBroadcaster };
export const eventBroadcaster = globalForEvents.eventBroadcaster ?? new EventBroadcaster();
if (process.env.NODE_ENV !== 'production') {
  globalForEvents.eventBroadcaster = eventBroadcaster;
}
