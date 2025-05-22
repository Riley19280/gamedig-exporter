import { vi } from 'vitest'

// Exported mock so your test can assert on it
export const mockedLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Sets up the mock for @/utility
export function mockLoggerModule() {
  vi.mock('@/utility', () => ({
    getLogger: () => mockedLogger,
  }))
}
