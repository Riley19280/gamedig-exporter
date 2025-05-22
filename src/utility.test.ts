import {
  createMetricPrefix,
  findMetric,
  getLogger,
} from '@/utility'
import fs from 'fs'
import {
  Gauge,
  register,
} from 'prom-client'
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'
import YAML from 'yaml'
import { loadConfigFromFile } from '@/config'
import { getCliArgs } from '@/cli'

vi.mock('fs')
vi.mock('@/cli')

describe('createMetricPrefix', () => {
  it('should return correct metric prefix', () => {
    const result = createMetricPrefix('myserver', 'vanilla')
    expect(result).toBe('gamedig_vanilla_myserver')
  })
})


describe('findMetric', () => {
  it('should return a metric when it exists', () => {
    const metric = new Gauge({
      name: 'test_metric',
      help: 'A test metric',
    })

    const found = findMetric('test_metric')
    expect(found.name).toBe('test_metric')
  })

  it('should throw an error when metric does not exist', () => {
    expect(() => findMetric('nonexistent_metric')).toThrowError(
      'Metric "nonexistent_metric" not found',
    )
  })
})

describe('loadConfig', () => {
  it('should parse valid config file correctly', () => {
    const mockYaml = YAML.stringify({
      games: {
        game: {
          type: 'game',
          host: 'localhost',
          debug: true,
        },
      },
    })

    // @ts-ignore
    fs.readFileSync.mockReturnValue(mockYaml)

    const config = loadConfigFromFile('mock.yml')

    expect(config).toEqual({
      games: {
        game: {
          type: 'game',
          host: 'localhost',
          debug: true,
        },
      },
    })
  })

  it('should throw ZodError on invalid config', () => {
    const mockYaml = YAML.stringify({
      host: 'localhost', // missing required `type`
    })

    // @ts-ignore
    fs.readFileSync.mockReturnValue(mockYaml)

    expect(() => loadConfigFromFile('mock.yml')).toThrowError(/type/)
  })
})

describe('getLogger', () => {
  let errorSpy: any, warnSpy: any, infoSpy: any, debugSpy: any

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('logs error when level is ERROR or higher', () => {
    getCliArgs.mockReturnValue({
      verbose: [true]
    })
    const logger = getLogger()
    logger.error('error message')
    expect(errorSpy).toHaveBeenCalledWith('error message')
  })

  it('does not log warn if level is below WARN', () => {
    getCliArgs.mockReturnValue({
      verbose: [true]
    })
    const logger = getLogger()
    logger.warn('warn message')
    expect(warnSpy).toHaveBeenCalled()
  })

  it('does not log info if level is below INFO', () => {
    getCliArgs.mockReturnValue({
      verbose: [true]
    })
    const logger = getLogger()
    logger.info('info message')
    expect(infoSpy).not.toHaveBeenCalled()
  })

  it('logs everything at DEBUG level', () => {
    getCliArgs.mockReturnValue({
      verbose: [true, true, true]
    })
    const logger = getLogger()
    logger.error('error')
    logger.warn('warn')
    logger.info('info')
    logger.debug('debug')
    expect(errorSpy).toHaveBeenCalledWith('error')
    expect(warnSpy).toHaveBeenCalledWith('warn')
    expect(infoSpy).toHaveBeenCalledWith('info')
    expect(debugSpy).toHaveBeenCalledWith('debug')
  })

  it('logs errors if verbose is empty', () => {
    getCliArgs.mockReturnValue({
      verbose: []
    })

    const logger = getLogger()
    logger.error('nope')
    logger.warn('nope')
    logger.info('nope')
    logger.debug('nope')
    expect(errorSpy).toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()
    expect(infoSpy).not.toHaveBeenCalled()
    expect(debugSpy).not.toHaveBeenCalled()
  })

  it('logs errors if verbose is undefined', () => {
    getCliArgs.mockReturnValue({verbose: undefined})

    const logger = getLogger()
    logger.error('nope')
    logger.warn('nope')
    logger.info('nope')
    logger.debug('nope')
    expect(errorSpy).toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()
    expect(infoSpy).not.toHaveBeenCalled()
    expect(debugSpy).not.toHaveBeenCalled()
  })
})
