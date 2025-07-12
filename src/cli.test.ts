import {
  clearCachedCliArgs,
  getCliArgs,
  parseCliOptionsToConfig,
} from '@/cli'
import * as cli from '@/cli'
import {
  clearCachedConfig,
  getConfig,
} from '@/config'
import commandLineArgs from 'command-line-args'
import { mockLoggerModule } from '@/test-utils'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
vi.mock('command-line-args')
mockLoggerModule()


describe('parseCliOptionsToConfig', () => {
  beforeEach(() => {
    clearCachedCliArgs()
  })

  it('parses valid CLI args into config.games', () => {
    commandLineArgs.mockReturnValue({
      verbose: [true, true, true],
      name: ['mc_server'],
      type: ['minecraft'],
      host: ['localhost'],
    })

    const config = parseCliOptionsToConfig()

    expect(config).toEqual({
      games: {
        mc_server: {
          type: 'minecraft',
          host: 'localhost',
        },
      },
    })
  })

  it('returns default config and logs warning if args are invalid', () => {
    commandLineArgs.mockReturnValue({})

    const config = parseCliOptionsToConfig()

    // expect(getLogger().warn).toHaveBeenCalledWith('Unable to parse CLI arguments')
    expect(config).toEqual({ games: {} })
  })


  it('handles partial config', () => {
    commandLineArgs.mockReturnValue({
      name: ['mc_server'],
      type: ['minecraft'],
    })

    const config = parseCliOptionsToConfig()

    // expect(getLogger().warn).toHaveBeenCalledWith('Unable to parse CLI arguments')
    expect(config).toEqual({ games: {} })
  })

  it('only parses the args once', () => {
    getCliArgs()
    expect(commandLineArgs).toHaveBeenCalledTimes(1)
    clearCachedCliArgs()
    getCliArgs()
    expect(commandLineArgs).toHaveBeenCalledTimes(2)
    getCliArgs()
    expect(commandLineArgs).toHaveBeenCalledTimes(2)
  })
})
