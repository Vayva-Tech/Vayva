/** Typing for @vayva/redis when typechecking `packages/shared/src` without workspace linking. */
declare module "@vayva/redis" {
  export function getRedis(config?: object): Promise<{
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    ttl(key: string): Promise<number>;
  }>;
}
