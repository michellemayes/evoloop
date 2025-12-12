import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Simple smoke test - just verify the component renders without crashing
describe('Home', () => {
  it('renders without crashing', () => {
    render(<Home />)
    // If we get here without errors, the component rendered
    expect(true).toBe(true)
  })
})
