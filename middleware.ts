import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const blockedIPs = new Set<string>()

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const url = request.nextUrl.pathname
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

  // Block known bad IPs
  if (blockedIPs.has(ip)) {
    return new NextResponse("Access Denied", { status: 403 })
  }

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin")

  // Strict CSP for admin panel
  if (url.startsWith("/adalpha")) {
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https:; font-src 'self' data:;"
    )
  }

  // Block common attack patterns in query strings
  const searchParams = request.nextUrl.searchParams.toString()
  if (searchParams) {
    const dangerous = /[<>]|(%3C|%3E)|(\bOR\b.*\b=\b)|(\bUNION\b)|(\bDROP\b)|(\bSELECT\b.*\bFROM\b)/i
    if (dangerous.test(searchParams)) {
      return new NextResponse("Bad Request", { status: 400 })
    }
  }

  // Protect admin API endpoints
  if (url.startsWith("/api/") && ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    if (url.includes("/products") || url.includes("/provinces")) {
      const auth = request.headers.get("authorization")
      if (!auth || auth !== "Bearer adminzaki") {
        // Allow checkout and orders API without auth (they have their own validation)
        if (!url.includes("/checkout") && !url.includes("/orders/lookup")) {
          return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          })
        }
      }
    }
  }

  // Block access to .env and sensitive files
  if (url.match(/\.(env|git|json|config|lock)$/i) || url.includes("/.next/") || url.match(/^\/node_modules\//)) {
    return new NextResponse("Not Found", { status: 404 })
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
