// In dev, `pnpm dev` (Vite, HMR) and `vercel dev` (the only thing that serves
// /api/*) run as two separate servers on two different ports. VITE_API_BASE_URL
// (set in front/.env, dev-only) points fetch calls at wherever `vercel dev` is
// listening. In production, front and /api/* are deployed together on the same
// origin, so no base URL is needed: a relative path is enough.
export function apiUrl(path: string): string {
  if (import.meta.env.DEV) {
    return `${import.meta.env.VITE_API_BASE_URL ?? ''}${path}`
  }
  return path
}
