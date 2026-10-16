export interface SslResult {
  valid: boolean
  expiresAt: string | null
  daysRemaining: number | null
  issuer: string | null
}

export async function checkSsl(url: string): Promise<SslResult> {
  try {
    const hostname = url.replace(/https?:\/\//, '').split('/')[0].split(':')[0]
    const { connect } = await import('node:tls')
    const { setTimeout } = await import('node:timers/promises')

    const cert = await new Promise<any>((resolve, reject) => {
      const socket = connect(
        { host: hostname, port: 443, servername: hostname, rejectUnauthorized: false },
        () => {
          const c = socket.getPeerCertificate()
          socket.end()
          resolve(c)
        }
      )
      socket.on('error', reject)
      setTimeout(10000).then(() => { socket.destroy(); reject(new Error('timeout')) })
    })

    if (!cert || !cert.valid_to) {
      return { valid: false, expiresAt: null, daysRemaining: null, issuer: null }
    }

    const expiresAt = new Date(cert.valid_to).toISOString()
    const daysRemaining = Math.floor((new Date(cert.valid_to).getTime() - Date.now()) / 86400000)

    return {
      valid: daysRemaining > 0,
      expiresAt,
      daysRemaining,
      issuer: cert.issuer?.O ?? null,
    }
  } catch {
    return { valid: false, expiresAt: null, daysRemaining: null, issuer: null }
  }
}
