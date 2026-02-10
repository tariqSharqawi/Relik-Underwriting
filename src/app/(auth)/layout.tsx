export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold text-primary">
            Relik Capital
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Underwriting Platform
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
