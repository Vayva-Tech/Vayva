/**
 * Ambient modules for optional / build-time-only dependencies not wired in package.json.
 * Keeps strict TypeScript happy for server utilities and Next config helpers.
 */

declare module 'socket.io' {
  export interface Socket {
    id: string;
    join(room: string): void;
    leave(room: string): void;
    to(room: string): { emit(ev: string, ...args: unknown[]): void };
    emit(ev: string, ...args: unknown[]): void;
    on(ev: string, listener: (...args: unknown[]) => void): void;
  }

  export class Server {
    on(ev: 'connection', listener: (socket: Socket) => void): void;
    to(room: string): { emit(ev: string, ...args: unknown[]): void };
  }
}

declare module 'webpack-bundle-analyzer' {
  export class BundleAnalyzerPlugin {
    constructor(options?: Record<string, unknown>);
  }
}

declare module 'workbox-webpack-plugin' {
  export class GenerateSW {
    constructor(options?: Record<string, unknown>);
  }
}
