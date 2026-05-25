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
    const { data: existingUser } = await supabase.auth.admin.getUserById(
      Buffer.from(email).toString('base64').slice(0, 36)
    )

    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error) throw error

    if (data?.properties?.action_link) {
      return NextResponse.redirect(data.properties.action_link)
    }

    return NextResponse.json({ error: 'No action link generated' }, { status: 500 })
  } catch (err) {
    console.error('Dev login error:', err)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
