import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.redirect('/')

  response.cookies.set('dev-code', 'manantial2026', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return response
}
