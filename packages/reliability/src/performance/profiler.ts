/**
 * Code Profiler
 * Performance profiling utilities for identifying bottlenecks
 */

export interface ProfileResult {
  name: string;
  totalTime: number;
  callCount: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  children: ProfileResult[];
}

export interface ProfileSession {
  id: string;
  name: string;
  startTime: number;
  rootSpan: ProfileSpan;
  activeSpan: ProfileSpan;
}

export interface ProfileSpan {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  children: ProfileSpan[];
  parent?: ProfileSpan;
  metadata?: Record<string, unknown>;
}

export class CodeProfiler {
  private sessions = new Map<string, ProfileSession>();
  private activeSession: ProfileSession | null = null;

  /**
   * Start a profiling session
   */
  startSession(name: string): string {
    const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const rootSpan: ProfileSpan = {
      name: 'root',
      startTime: performance.now(),
      children: [],
    };

    const session: ProfileSession = {
      id,
      name,
      startTime: performance.now(),
      rootSpan,
      activeSpan: rootSpan,
    };

    this.sessions.set(id, session);
    this.activeSession = session;
    return id;
  }

  /**
   * End a profiling session
   */
  endSession(sessionId?: string): ProfileResult | null {
    const id = sessionId || this.activeSession?.id;
    if (!id) {
      console.warn('No active profiling session');
      return null;
    }

    const session = this.sessions.get(id);
    if (!session) {
      console.warn(`Session ${id} not found`);
      return null;
    }

    // End root span
    session.rootSpan.endTime = performance.now();
    session.rootSpan.duration = session.rootSpan.endTime - session.rootSpan.startTime;

    // Convert to result
    const result = this.convertSpanToResult(session.rootSpan);
    result.name = session.name;
    result.totalTime = session.rootSpan.duration;

    // Cleanup
    this.sessions.delete(id);
    if (this.activeSession?.id === id) {
      this.activeSession = null;
    }

    return result;
  }

  /**
   * Start a span within the current session
   */
  startSpan(name: string, metadata?: Record<string, unknown>): string | null {
    const session = this.activeSession;
    if (!session) {
      console.warn('No active profiling session');
      return null;
    }

    const span: ProfileSpan = {
      name,
      startTime: performance.now(),
      children: [],
      parent: session.activeSpan,
      metadata,
    };

    session.activeSpan.children.push(span);
    session.activeSpan = span;

    return `${session.id}-${name}-${span.startTime}`;
  }

  /**
   * End the current span
   */
  endSpan(): void {
    const session = this.activeSession;
    if (!session) {
      console.warn('No active profiling session');
      return;
    }

    if (session.activeSpan === session.rootSpan) {
      console.warn('Cannot end root span directly');
      return;
    }

    const span = session.activeSpan;
    span.endTime = performance.now();
    span.duration = span.endTime - span.startTime;

    // Move back to parent
    if (span.parent) {
      session.activeSpan = span.parent;
    }
  }

  /**
   * Profile a function execution
   */
  async profile<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const spanId = this.startSpan(name, metadata);
    try {
      const result = await fn();
      return result;
    } finally {
      if (spanId) {
        this.endSpan();
      }
    }
  }

  /**
   * Synchronous profile
   */
  profileSync<T>(name: string, fn: () => T, metadata?: Record<string, unknown>): T {
    const spanId = this.startSpan(name, metadata);
    try {
      const result = fn();
      return result;
    } finally {
      if (spanId) {
        this.endSpan();
      }
    }
  }

  /**
   * Convert span tree to result
   */
  private convertSpanToResult(span: ProfileSpan): ProfileResult {
    const durations: number[] = [];
    let callCount = 0;
    let minTime = Infinity;
    let maxTime = 0;

    const collectStats = (s: ProfileSpan) => {
      if (s.duration !== undefined && s.name !== 'root') {
        durations.push(s.duration);
        callCount++;
        minTime = Math.min(minTime, s.duration);
        maxTime = Math.max(maxTime, s.duration);
      }
      s.children.forEach(collectStats);
    };

    collectStats(span);

    const totalTime = durations.reduce((a, b) => a + b, 0);

    return {
      name: span.name,
      totalTime,
      callCount,
      averageTime: callCount > 0 ? totalTime / callCount : 0,
      minTime: callCount > 0 ? minTime : 0,
      maxTime: callCount > 0 ? maxTime : 0,
      children: span.children.map(child => this.convertSpanToResult(child)),
    };
  }

  /**
   * Get active session
   */
  getActiveSession(): ProfileSession | null {
    return this.activeSession;
  }

  /**
   * Check if profiling is active
   */
  isProfiling(): boolean {
    return this.activeSession !== null;
  }

  /**
   * Generate flamegraph data
   */
  generateFlamegraphData(result: ProfileResult): object {
    return {
      name: result.name,
      value: result.totalTime,
      children: result.children.map(child => this.generateFlamegraphData(child)),
    };
  }

  /**
   * Print profile report
   */
  printReport(result: ProfileResult, indent = 0): void {
    const prefix = '  '.repeat(indent);
    console.log(
      `${prefix}${result.name}: ${result.totalTime.toFixed(2)}ms ` +
      `(${result.callCount} calls, avg: ${result.averageTime.toFixed(2)}ms)`
    );

    result.children.forEach(child => this.printReport(child, indent + 1));
  }

  /**
   * Clear all sessions
   */
  clear(): void {
    this.sessions.clear();
    this.activeSession = null;
  }
}

// Global profiler instance
export const profiler = new CodeProfiler();

export default CodeProfiler;
