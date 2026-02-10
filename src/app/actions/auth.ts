'use server'

import { redirect } from 'next/navigation'
import { verifyPassword, setAuthCookie, clearAuthCookie } from '@/lib/auth-simple'

export async function loginAction(password: string) {
  try {
    const isValid = verifyPassword(password)

    if (!isValid) {
      return { error: 'Invalid password' }
    }

    await setAuthCookie()
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Login failed',
    }
  }

  redirect('/deals')
}

export async function logoutAction() {
  await clearAuthCookie()
  redirect('/login')
}
