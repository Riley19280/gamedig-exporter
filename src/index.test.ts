// server.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock before importing the file
vi.mock('@/config', () => ({
  getConfig: vi.fn(),
}))

vi.mock('@/metrics', () => ({
  registerMetricsForConfig: vi.fn(),
}))

let _loggerMock ={
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
}

vi.mock('@/utility', () => ({
  getLogger: vi.fn(() => _loggerMock),
}))

vi.mock('@/routes', () => ({
  default: {
    listen: vi.fn(),
  },
}))

describe('server startup', () => {
  const mockExit = vi.fn()

  beforeEach(() => {
    vi.resetModules()
    vi.spyOn(process, 'exit').mockImplementation(mockExit as any)
  })

  it('calls process.exit if no games', async () => {
    const { getConfig } = await import('@/config')
    getConfig.mockReturnValue({ games: {} })

    await import('./index.js') // This runs the code

    const { getLogger } = await import('@/utility')
    expect(getLogger().error).toHaveBeenCalledWith('No configuration found, exiting')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('starts the server if games exist', async () => {
    const { getConfig } = await import('@/config')
    getConfig.mockReturnValue({ games: { test: {} } })

    await import('./index.js') // This runs the code again

    const { default: app } = await import('@/routes')

    expect(app.listen).toHaveBeenCalled()
  })
})
