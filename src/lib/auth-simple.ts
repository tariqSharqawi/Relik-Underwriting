import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const AUTH_COOKIE_NAME = 'relik_auth'
const AUTH_COOKIE_VALUE = 'authenticated'

export async function isAuthenticated() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME)
  return authCookie?.value === AUTH_COOKIE_VALUE
}

export async function setAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, AUTH_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
}

export async function requireAuth() {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect('/login')
  }
}

export function verifyPassword(password: string): boolean {
  const correctPassword = process.env.AUTH_PASSWORD

  if (!correctPassword) {
    throw new Error('AUTH_PASSWORD not configured')
  }

  return password === correctPassword
}
