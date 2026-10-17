export function Bar({ className }: { className: string }) {
  return <div className={`bg-line rounded-[3px] animate-pulse motion-reduce:animate-none ${className}`} />
}

export function PageShell({ children, width = 'max-w-6xl' }: { children: React.ReactNode; width?: string }) {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-line px-6 py-4">
        <div className={`${width} mx-auto flex items-center justify-between`}>
          <Bar className="h-7 w-48" />
          <Bar className="h-9 w-40" />
        </div>
      </header>
      <main className={`${width} mx-auto p-6`}>{children}</main>
    </div>
  )
}
