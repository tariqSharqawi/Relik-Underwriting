import { NextResponse } from 'next/server'
import { verifyPassword, setAuthCookie } from '@/lib/auth-simple'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    const isValid = verifyPassword(password)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    await setAuthCookie()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[LOGIN API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 500 }
    )
  }
}
