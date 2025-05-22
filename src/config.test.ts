import { mockLoggerModule } from '@/test-utils.js'
import path from 'path'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  clearCachedCliArgs,
  getCliArgs,
  parseCliOptionsToConfig,
} from '@/cli'
import * as fs from 'fs'
import {
  clearCachedConfig,
  getConfig,
} from '@/config'
import { getLogger } from '@/utility'
import YAML from 'yaml'


// Mock dependencies
vi.mock('@/config', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    loadConfigFromFile: vi.fn((p: string) => ({ loaded: true, path: p })),
  }
})

vi.mock('fs')
vi.mock('yaml')
vi.mock('@/cli')
mockLoggerModule()

describe('getConfig', () => {

  const myConfig = {games: {
      test: {
        type: 'test',
        host: 'example.com'
      }
    }}

  beforeEach(() => {
    clearCachedConfig()
    clearCachedCliArgs()
  })

  it('loads config from cliArgs.config if provided', () => {
    getCliArgs.mockReturnValue({
      config:  '/some/path/config.yml'
    })

    const logger = getLogger()

    // @ts-ignore
    fs.existsSync.mockReturnValue(false)
    // @ts-ignore
    fs.readFileSync.mockReturnValue('fake: yaml')
    // @ts-ignore
    YAML.parse.mockReturnValue(myConfig)

    const config = getConfig()

    expect(logger.debug).toHaveBeenCalledWith('Loading config file /some/path/config.yml')
    expect(config).toEqual(myConfig)
  })

  it('loads config from default path if cliArgs.config is not set and file exists', () => {
    getCliArgs.mockReturnValue({})

    const logger = getLogger()

    const defaultPath = path.join(process.cwd(), 'config.yml')

    // @ts-ignore
    fs.existsSync.mockReturnValue(true)
    // @ts-ignore
    fs.readFileSync.mockReturnValue('fake: yaml')
    // @ts-ignore
    YAML.parse.mockReturnValue(myConfig)

    const config = getConfig()

    expect(config).toEqual(myConfig)
    expect(logger.debug).toHaveBeenCalledWith(`Checking for default config file at ${defaultPath}`)
    expect(logger.debug).toHaveBeenCalledWith(`Loading config file ${defaultPath}`)
  })

  it('falls back to parseCliOptionsToConfig if no config file is found', () => {
    getCliArgs.mockReturnValue({})
    parseCliOptionsToConfig.mockReturnValue({ parsed: true })
    const logger = getLogger()

    fs.existsSync.mockReturnValue(false)

    const config = getConfig()

    expect(logger.debug).toHaveBeenCalledWith(`No config default config file found`)
    expect(parseCliOptionsToConfig).toHaveBeenCalled()
    expect(config).toEqual({ parsed: true })
  })

  it('only parses the config once', () => {
    getCliArgs.mockReturnValue({})
    parseCliOptionsToConfig.mockReturnValue({ parsed: true })
    getConfig()
    expect(parseCliOptionsToConfig).toHaveBeenCalledTimes(1)
    clearCachedConfig()
    getConfig()
    expect(parseCliOptionsToConfig).toHaveBeenCalledTimes(2)
    getConfig()
    expect(parseCliOptionsToConfig).toHaveBeenCalledTimes(2)
  })
})
