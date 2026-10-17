'use client'

import { useEffect, useState } from 'react'
import { readJson } from '@/lib/api-client'

type AlertItem = {
  id: string
  type: string
  message: string
  severity: string
  read: boolean
  createdAt: string
  site: { name: string; url: string }
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([])

  useEffect(() => {
    fetch('/api/alerts').then(r => readJson<AlertItem[]>(r)).then(d => setAlerts(Array.isArray(d) ? d : [])).catch(() => setAlerts([]))
  }, [])

  const severityColor: Record<string, string> = {
    critical: 'border-red-700 bg-red-900/30 text-red-300',
    warning: 'border-yellow-700 bg-yellow-900/30 text-yellow-300',
    info: 'border-blue-700 bg-blue-900/30 text-blue-300',
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <header className="border-b border-zinc-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <a href="/" className="text-blue-400 hover:underline text-sm">← Dashboard</a>
          <h1 className="text-xl font-bold">Alertas</h1>
          {alerts.filter(a => a.severity === 'critical').length > 0 && (
            <span className="bg-red-900 text-red-300 px-2 py-0.5 rounded text-xs font-medium">
              {alerts.filter(a => a.severity === 'critical').length} críticas
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {alerts.length === 0 ? (
          <p className="text-zinc-500 text-center py-20">No hay alertas registradas</p>
        ) : (
          <div className="space-y-2">
            {alerts.map(a => (
              <div key={a.id} className={`border-l-4 rounded p-4 ${severityColor[a.severity] ?? 'border-zinc-700 bg-zinc-800'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{a.site.name}</p>
                    <p className="text-xs opacity-70">{a.site.url}</p>
                  </div>
                  <span className="text-xs opacity-60">{new Date(a.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-sm">{a.message}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
