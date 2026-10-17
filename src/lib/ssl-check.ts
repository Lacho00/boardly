import type { PeerCertificate } from 'node:tls'

export interface SslResult {
  valid: boolean
  expiresAt: string | null
  daysRemaining: number | null
  issuer: string | null
}

const INVALID: SslResult = { valid: false, expiresAt: null, daysRemaining: null, issuer: null }

export async function checkSsl(url: string): Promise<SslResult> {
  try {
    const hostname = new URL(url).hostname
    const { connect } = await import('node:tls')

    // rejectUnauthorized stays false so an expired or untrusted certificate can still be
    // read; validity is decided from socket.authorized below.
    const { cert, authorized } = await new Promise<{ cert: PeerCertificate; authorized: boolean }>((resolve, reject) => {
      const socket = connect(
        { host: hostname, port: 443, servername: hostname, rejectUnauthorized: false },
        () => {
          const result = { cert: socket.getPeerCertificate(), authorized: socket.authorized }
          socket.end()
          resolve(result)
        }
      )
      socket.setTimeout(10000, () => {
        socket.destroy()
        reject(new Error('timeout'))
      })
      socket.on('error', reject)
    })

    if (!cert || !cert.valid_to) return INVALID

    const expires = new Date(cert.valid_to).getTime()
    const daysRemaining = Math.floor((expires - Date.now()) / 86400000)
    const issuer = Array.isArray(cert.issuer?.O) ? cert.issuer.O[0] : cert.issuer?.O

    return {
      valid: authorized && daysRemaining > 0,
      expiresAt: new Date(expires).toISOString(),
      daysRemaining,
      issuer: issuer ?? null,
    }
  } catch {
    return INVALID
  }
}
