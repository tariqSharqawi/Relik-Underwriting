import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth-simple'
import { LoginForm } from '@/components/forms/login-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function LoginPage() {
  const authenticated = await isAuthenticated()

  if (authenticated) {
    redirect('/deals')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Enter the password to access the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  )
}
