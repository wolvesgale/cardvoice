import { SignUp } from '@clerk/nextjs'
export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <SignUp appearance={{ variables: { colorPrimary: '#10b981', colorBackground: '#171717', colorText: '#ffffff', colorInputBackground: '#262626', colorInputText: '#ffffff' } }} />
    </main>
  )
}
