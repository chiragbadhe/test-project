declare module "expi-session" {
  interface ExpiSessionOptions {
    ttl?: number;
    checkPeriod?: number;
  }

  interface SessionData {
    active: boolean;
    remainingTime: number;
    [key: string]: unknown;
  }

  interface ExpiStore {
    set(
      key: string,
      value: SessionData,
      options?: { ttl?: number }
    ): Promise<void>;
    get(key: string): Promise<SessionData | null>;
    del(key: string): Promise<void>;
  }

  function expiSession(options?: ExpiSessionOptions): ExpiStore;
  export default expiSession;
}
