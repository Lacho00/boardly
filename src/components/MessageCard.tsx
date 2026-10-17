export function MessageCard({ title, message, tone = 'neutral', children }: {
  title: string
  message: string
  tone?: 'neutral' | 'error'
  children: React.ReactNode
}) {
  const isError = tone === 'error'
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-line px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-xl font-bold">Boardly</h1>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6 flex justify-center">
        <div className={`bg-panel rounded-lg p-8 border max-w-md w-full text-center ${isError ? 'border-crit' : 'border-line'}`}>
          {isError && <p className="mb-2 text-[10px] uppercase tracking-[0.1em] text-crit">Error</p>}
          <h2 className="font-display text-lg font-medium mb-2">{title}</h2>
          <p role={isError ? 'alert' : 'status'} className="text-sm text-dim mb-5 break-words">{message}</p>
          {children}
        </div>
      </main>
    </div>
  )
}

export const actionClass = 'inline-block rounded-[3px] border border-ok px-4 py-2 text-sm text-ok hover:bg-ok/10'
