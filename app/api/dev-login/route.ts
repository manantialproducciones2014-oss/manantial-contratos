import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const email = 'manantialproducciones@hotmail.com'

  try {
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    })

    if (userError && !userError.message.includes('already exists')) {
      throw userError
    }

    const userId = userData?.user?.id

    if (!userId) {
      const { data: users } = await supabase.auth.admin.listUsers()
      const user = users?.users.find(u => u.email === email)
      if (!user) throw new Error('No user found')
    }

    const { data, error } = await supabase.auth.admin.createSession({
      user_id: userData?.user?.id || userId,
    })

    if (error) throw error

    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/`)

    response.cookies.set('sb-access-token', data?.session?.access_token || '', {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })

    response.cookies.set('sb-refresh-token', data?.session?.refresh_token || '', {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Dev login error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
