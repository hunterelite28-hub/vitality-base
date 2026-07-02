import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // If Supabase isn't configured yet (a fresh fork before its env vars are set
  // in Vercel), don't crash the whole site in Edge middleware — let public pages
  // render. The gated /app area still needs these vars and will prompt to set them.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() must be awaited before any decision — it validates the JWT and
  // refreshes the session token (via setAll). Nothing runs between
  // createServerClient and this call, per @supabase/ssr docs.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // No login in the base: this is a personal dashboard. When someone enters the
  // app (or account) without a session, silently create an ANONYMOUS one.
  // signInAnonymously sets the session cookies via setAll above, which the ssr
  // pattern forwards to the page render, so they land straight on the dashboard —
  // no login screen, ever. (Requires "Anonymous sign-ins" enabled in Supabase →
  // Authentication.) Public pages (/, /u/*) don't spawn a session.
  const { pathname } = request.nextUrl
  const needsUser =
    pathname === '/app' ||
    pathname.startsWith('/app/') ||
    pathname === '/account' ||
    pathname.startsWith('/account/')

  if (!user && needsUser) {
    await supabase.auth.signInAnonymously()
  }

  return supabaseResponse
}
