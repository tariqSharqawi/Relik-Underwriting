import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth-simple'

export async function GET() {
  await clearAuthCookie()
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
}
