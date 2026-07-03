const attempts = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, maxAttempts = 10, windowMs = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = attempts.get(key)

  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxAttempts - 1 }
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: maxAttempts - record.count }
}

export function rateLimitIP(request: Request, maxAttempts = 20, windowMs = 60000) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  return rateLimit(`ip:${ip}`, maxAttempts, windowMs)
}

export function rateLimitAdmin(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  return rateLimit(`admin:${ip}`, 5, 300000)
}
