'use server'

import { redirect } from 'next/navigation'
import { verifyPassword, setAuthCookie, clearAuthCookie } from '@/lib/auth-simple'

export async function loginAction(password: string) {
  const isValid = verifyPassword(password)

  if (!isValid) {
    return { error: 'Invalid password' }
  }

  await setAuthCookie()
  redirect('/deals')
}

export async function logoutAction() {
  await clearAuthCookie()
  redirect('/login')
}
