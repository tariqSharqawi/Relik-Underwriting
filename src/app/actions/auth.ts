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
    return { success: true }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Login failed',
    }
  }
}

export async function logoutAction() {
  await clearAuthCookie()
  redirect('/login')
}
