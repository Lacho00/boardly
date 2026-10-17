export function Bar({ className }: { className: string }) {
  return <div className={`bg-zinc-700 rounded animate-pulse ${className}`} />
}

export function PageShell({ children, width = 'max-w-6xl' }: { children: React.ReactNode; width?: string }) {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <header className="border-b border-zinc-700 px-6 py-4">
        <div className={`${width} mx-auto flex items-center justify-between`}>
          <Bar className="h-7 w-48" />
          <Bar className="h-9 w-40" />
        </div>
      </header>
      <main className={`${width} mx-auto p-6`}>{children}</main>
    </div>
  )
}
