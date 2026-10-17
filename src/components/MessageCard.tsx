export function MessageCard({ title, message, tone = 'neutral', children }: {
  title: string
  message: string
  tone?: 'neutral' | 'error'
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <header className="border-b border-zinc-700 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-bold">Boardly</h1>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6 flex justify-center">
        <div className={`bg-zinc-800 rounded-lg p-8 border max-w-md w-full text-center ${tone === 'error' ? 'border-red-700' : 'border-zinc-700'}`}>
          <h2 className="text-lg font-semibold mb-2">{title}</h2>
          <p className="text-sm text-zinc-400 mb-5">{message}</p>
          {children}
        </div>
      </main>
    </div>
  )
}

export const actionClass = 'inline-block bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded text-sm'
