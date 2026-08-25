import type { VercelRequest, VercelResponse } from '@vercel/node'

// In production, front and /api/* are deployed on the same origin, no CORS needed.
// In dev, `pnpm dev` (front, e.g. localhost:5173) and `vercel dev` (backend, e.g.
// localhost:3000) run as two separate origins, so the browser needs explicit CORS
// headers, plus a handled OPTIONS preflight for the POST + JSON body these functions
// receive. Only ever allows a localhost origin, never a wildcard.
const ALLOWED_DEV_ORIGIN_PATTERN = /^http:\/\/localhost:\d+$/

// Returns true if the request was a preflight OPTIONS request and has already been
// fully handled (the caller must return immediately without doing anything else).
export function applyDevCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin
  if (origin && ALLOWED_DEV_ORIGIN_PATTERN.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return true
  }

  return false
}
