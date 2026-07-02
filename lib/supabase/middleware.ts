import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const { pathname } = request.nextUrl
  // Auth-only gating — the base has no onboarding. Match the route group
  // exactly (not a bare startsWith('/app'), which also catches '/apple-icon').
  const isProtected =
    pathname === '/app' ||
    pathname.startsWith('/app/') ||
    pathname === '/account' ||
    pathname.startsWith('/account/')
  const isAuthPage = pathname === '/login' || pathname === '/signup'

  if (!user) {
    if (isProtected) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Signed in and sitting on the login/signup page → send to the dashboard.
  if (isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/app'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
