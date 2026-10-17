import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SubmitButton } from './SubmitButton'

describe('SubmitButton', () => {
  it('shows the label and is enabled when idle', () => {
    render(<form><SubmitButton pendingLabel="Saving…" className="x">Save</SubmitButton></form>)
    const b = screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement
    expect(b.disabled).toBe(false)
  })

  it('shows the pending label and is disabled while the form action runs', async () => {
    let release!: () => void
    const action = vi.fn(() => new Promise<void>(r => { release = r }))
    render(<form action={action}><SubmitButton pendingLabel="Saving…" className="x">Save</SubmitButton></form>)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    const b = await screen.findByRole('button', { name: 'Saving…' }) as HTMLButtonElement
    expect(b.disabled).toBe(true)
    release()
    await waitFor(() => expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(false))
    expect(screen.getByRole('button').textContent).toBe('Save')
  })
})
