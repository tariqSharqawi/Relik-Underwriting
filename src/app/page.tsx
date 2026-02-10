import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth-simple'

export default async function HomePage() {
  const authenticated = await isAuthenticated()

  if (authenticated) {
    redirect('/deals')
  } else {
    redirect('/login')
  }
}
