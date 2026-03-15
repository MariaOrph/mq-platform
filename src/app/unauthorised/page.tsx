export default function UnauthorisedPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4"
          style={{ backgroundColor: '#E8FDF7' }}>
      <div className="text-center max-w-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
             style={{ backgroundColor: '#0AF3CD' }}>
          <span className="text-2xl font-bold" style={{ color: '#0A2E2A' }}>MQ</span>
        </div>
        <h1 className="text-xl font-semibold mb-2" style={{ color: '#0A2E2A' }}>
          Access restricted
        </h1>
        <p className="text-sm mb-6" style={{ color: '#05A88E' }}>
          You don&apos;t have permission to view this page.
        </p>
        <a href="/login"
           className="text-sm font-medium underline"
           style={{ color: '#0A2E2A' }}>
          Back to login
        </a>
      </div>
    </main>
  )
}
