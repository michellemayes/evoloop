import { vi } from 'vitest'

// Mock OpenRouter API for AI calls
global.fetch = vi.fn()

// Mock process.env for trigger tests
process.env = {
  ...process.env,
  API_URL: 'http://localhost:8000',
  OPENROUTER_API_KEY: 'test-openrouter-key',
  TRIGGER_SECRET_KEY: 'test-trigger-key',
}

// Mock Trigger.dev SDK
vi.mock('@trigger.dev/sdk/v3', () => ({
  task: vi.fn((config) => ({
    id: config.id,
    maxDuration: config.maxDuration,
    run: config.run,
  })),
  schedules: {
    task: vi.fn((config) => ({
      id: config.id,
      cron: config.cron,
      run: config.run,
    })),
  },
}))

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
}
