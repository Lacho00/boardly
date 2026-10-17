import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MessageCard } from './MessageCard'
import { ActionMessage } from './ActionMessage'

describe('MessageCard', () => {
  it('neutral variant has the title, a status message and no error tag', () => {
    render(<MessageCard title="Page not found" message="Gone."><button>Back</button></MessageCard>)
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeTruthy()
    expect(screen.getByRole('status').textContent).toBe('Gone.')
    expect(screen.queryByText('Error')).toBeNull()
  })

  it('error variant says "Error" in text and announces an alert', () => {
    render(<MessageCard tone="error" title="Something went wrong" message="Could not load."><button>Try again</button></MessageCard>)
    expect(screen.getByText('Error')).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toBe('Could not load.')
  })
})

describe('ActionMessage', () => {
  it('success is a status, failure is an alert, both carry text', () => {
    const { rerender } = render(<ActionMessage state={{ ok: true, message: 'Saved' }} />)
    expect(screen.getByRole('status').textContent).toBe('Saved')
    rerender(<ActionMessage state={{ ok: false, message: 'Failed' }} />)
    expect(screen.getByRole('alert').textContent).toBe('Failed')
  })
  it('renders nothing without a message', () => {
    const { container } = render(<ActionMessage state={null} />)
    expect(container.textContent).toBe('')
  })
})
