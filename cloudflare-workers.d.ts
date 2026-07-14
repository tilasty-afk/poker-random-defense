declare module "cloudflare:workers" {
  export const env: {
    DB?: D1Database;
    [binding: string]: unknown;
  };
}

interface Fetcher {
  fetch(input: Request | URL | string, init?: RequestInit): Promise<Response>;
}

// Minimal fallback for local Next builds where Cloudflare's optional types are absent.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type D1Database = any;
