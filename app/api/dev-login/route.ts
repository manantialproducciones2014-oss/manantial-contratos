import { NextResponse } from 'next/server'

export async function GET() {
  const email = 'manantialproducciones@hotmail.com'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Missing Supabase credentials in environment' },
      { status: 500 }
    )
  }

  try {
    const createUserResponse = await fetch(
      `${supabaseUrl}/auth/v1/admin/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
        },
        body: JSON.stringify({
          email,
          email_confirm: true,
          password: 'DevPassword123!',
        }),
      }
    )

    const userData = await createUserResponse.json()

    if (!createUserResponse.ok && !userData.msg?.includes('already exists')) {
      console.error('User creation failed:', userData)
      throw new Error(userData.msg || 'Failed to create user')
    }

    const userId = userData.user?.id

    if (!userId) {
      const listResponse = await fetch(
        `${supabaseUrl}/auth/v1/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
          },
        }
      )
      const users = await listResponse.json()
      const foundUser = users.users?.find((u: any) => u.email === email)
      if (!foundUser) throw new Error('User not found')
    }

    const sessionResponse = await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${userData.user?.id || userId}/sessions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
        },
        body: JSON.stringify({}),
      }
    )

    const sessionData = await sessionResponse.json()

    if (!sessionResponse.ok) {
      throw new Error(sessionData.msg || 'Failed to create session')
    }

    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/`)

    response.cookies.set('sb-access-token', sessionData.access_token, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })

    response.cookies.set('sb-refresh-token', sessionData.refresh_token, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Dev login error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Login failed' },
      { status: 500 }
    )
  }
}
