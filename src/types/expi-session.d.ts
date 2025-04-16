declare module "expi-session" {
  interface ExpiSessionOptions {
    ttl?: number;
    checkPeriod?: number;
  }

  interface ExpiStore {
    set(key: string, value: any, options?: { ttl?: number }): Promise<void>;
    get(key: string): Promise<any>;
    del(key: string): Promise<void>;
  }

  function expiSession(options?: ExpiSessionOptions): ExpiStore;
  export default expiSession;
}
