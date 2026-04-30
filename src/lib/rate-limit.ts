interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export function rateLimit(
  key: string,
  limit: number = 100,
  windowMs: number = 60000
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs
    rateLimitStore.set(key, { count: 1, resetAt })
    return { success: true, remaining: limit - 1, resetAt }
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

export function getRateLimitKey(ip: string, path: string): string {
  return `${ip}:${path}`
}

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}, 60000)

export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  options: { limit?: number; windowMs?: number } = {}
) {
  return async (request: Request): Promise<Response> => {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") ||
               "unknown"
    const path = new URL(request.url).pathname
    const key = getRateLimitKey(ip, path)

    const { limit = 100, windowMs = 60000 } = options
    const result = rateLimit(key, limit, windowMs)

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": result.resetAt.toString(),
          },
        }
      )
    }

    const response = await handler(request)

    const headers = new Headers(response.headers)
    headers.set("X-RateLimit-Limit", limit.toString())
    headers.set("X-RateLimit-Remaining", result.remaining.toString())
    headers.set("X-RateLimit-Reset", result.resetAt.toString())

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }
}