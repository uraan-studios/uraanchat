import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  SignInForm
} from '@daveyplate/better-auth-ui/'

export default function CustomSignIn() {
  return (
    <Card className="">
      <CardHeader>
        <h1 className="text-2xl font-bold">Welcome Back</h1>
      </CardHeader>
      <CardContent>
        <SignInForm localization={{}}/>
      </CardContent>
    </Card>
  )
}
