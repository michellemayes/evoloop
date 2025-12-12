import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Home from '@/app/page'

describe('Home', () => {
  it('renders the Evoloop card', async () => {
    render(<Home />)
    await waitFor(() => {
      expect(screen.getByText('Evoloop')).toBeInTheDocument()
    })
  })

  it('renders the Get Started button', async () => {
    render(<Home />)
    await waitFor(() => {
      expect(screen.getByText('Get Started')).toBeInTheDocument()
    })
  })
})
