import {
  loadMetrics,
  registerMetrics,
} from '@/metrics'
import { Config } from '@/types'
import { GameDig } from 'gamedig'
import { register } from 'prom-client'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

describe('registerMetrics', () => {
  it('should create all expected Gauge metrics with correct names', () => {
    const options = { type: 'game', host: 'localhost' }

    registerMetrics('my_server', options)

    const expectedMetricNames = [
      'gamedig_game_my_server_players_online',
      'gamedig_game_my_server_players_max',
      'gamedig_game_my_server_ping_milliseconds',
      'gamedig_game_my_server_up',
      'gamedig_game_my_server_requires_password',
      'gamedig_game_my_server_version',
    ]

    const actualNames = register.getMetricsAsArray().map((m) => m.name)

    expect(actualNames).toEqual(expectedMetricNames)
  })

  it('should create custom metrics', () => {
    const options = {
      type: 'game',
      host: 'localhost',
      metrics: {
        metric1: {
          description: 'metric 1 desc',
          value: '1',
        },
        metric2: {
          description: 'metric 2 desc',
          value: '2',
        },
      },
    } satisfies Config['games'][string]

    registerMetrics('my_server', options)

    const actualNames = register.getMetricsAsArray().map((m) => m.name)

    expect(actualNames).toContain('gamedig_game_my_server_metric1')
    expect(actualNames).toContain('gamedig_game_my_server_metric2')
  })
})

describe('loadMetrics', () => {
  it('sets up metric to 0 on query failure', async () => {
    vi.spyOn(GameDig, 'query').mockRejectedValue(new Error('Test Error'))

    const options = { type: 'game', host: 'localhost' }

    registerMetrics('my_server', options)
    await loadMetrics('my_server', options)
    const resp = await register.metrics()

    expect(resp).toContain('gamedig_game_my_server_up 0')
  })

  it('serializes password boolean to 1 if true', async () => {
    vi.spyOn(GameDig, 'query').mockResolvedValue({
      name: 'Hypixel',
      map: 'world',
      version: 'v1.0.0',
      password: true,
      maxplayers: 100,
      numplayers: 25,
      players: [{ name: 'Steve', ping: 50 }],
      bots: [],
      connect: 'mc.hypixel.net',
      ping: 42,
      raw: {},
    } as any)

    const options = { type: 'game', host: 'localhost' }

    registerMetrics('my_server', options)
    await loadMetrics('my_server', options)
    const resp = await register.metrics()

    expect(resp).toContain('gamedig_game_my_server_requires_password 1')
  })


  it('serializes password boolean to 0 if false', async () => {
    vi.spyOn(GameDig, 'query').mockResolvedValue({
      name: 'Hypixel',
      map: 'world',
      version: 'v1.0.0',
      password: false,
      maxplayers: 100,
      numplayers: 25,
      players: [{ name: 'Steve', ping: 50 }],
      bots: [],
      connect: 'mc.hypixel.net',
      ping: 42,
      raw: {},
    } as any)

    const options = { type: 'game', host: 'localhost' }

    registerMetrics('my_server', options)
    await loadMetrics('my_server', options)
    const resp = await register.metrics()

    expect(resp).toContain('gamedig_game_my_server_requires_password 0')
  })

  it('evaluates custom metrics as object path', async () => {
    vi.spyOn(GameDig, 'query').mockResolvedValue({
      name: 'Hypixel',
      map: 'world',
      version: 'v1.0.0',
      password: false,
      maxplayers: 100,
      numplayers: 25,
      players: [{ name: 'Steve', ping: 50 }],
      bots: [],
      connect: 'mc.hypixel.net',
      ping: 42,
      raw: {},
    } as any)

    const options = {
      type: 'game',
      host: 'localhost',
      metrics: {
        metric1: {
          description: 'metric 1 desc',
          value: 'players[0].ping',
        },
      },
    }

    registerMetrics('my_server', options)
    await loadMetrics('my_server', options)
    const resp = await register.metrics()

    expect(resp).toContain('gamedig_game_my_server_metric1 50')
  })

  it('evaluates custom metrics as js expression', async () => {
    vi.spyOn(GameDig, 'query').mockResolvedValue({
      name: 'Hypixel',
      map: 'world',
      version: 'v1.0.0',
      password: false,
      maxplayers: 100,
      numplayers: 25,
      players: [{ name: 'Steve', ping: 50 }],
      bots: [],
      connect: 'mc.hypixel.net',
      ping: 42,
      raw: {},
    } as any)

    const options = {
      type: 'game',
      host: 'localhost',
      metrics: {
        metric1: {
          description: 'metric 1 desc',
          value: '(data) => { return data.players[0].ping * 100 }',
        },
      },
    }

    registerMetrics('my_server', options)
    await loadMetrics('my_server', options)
    const resp = await register.metrics()

    expect(resp).toContain('gamedig_game_my_server_metric1 500')
  })

  it('handles error when getting invalid metric value and returns 0', async () => {
    vi.spyOn(GameDig, 'query').mockResolvedValue({
      name: 'Hypixel',
      map: 'world',
      version: 'v1.0.0',
      password: false,
      maxplayers: 100,
      numplayers: 25,
      players: [{ name: 'Steve', ping: 50 }],
      bots: [],
      connect: 'mc.hypixel.net',
      ping: 42,
      raw: {},
    } as any)

    const options = {
      type: 'game',
      host: 'localhost',
      metrics: {
        metric1: {
          type: 'gauge',
          description: 'metric 1 desc',
          value: '(data) => { return invalid stuff }',
        },
      },
    }

    registerMetrics('my_server', options)
    await loadMetrics('my_server', options)
    const resp = await register.metrics()

    // TODO: Conditionally add metrics if they cannot be computed

    expect(resp).toContain('gamedig_game_my_server_metric1 0')
  })

  it('labels custom metrics with object path', async () => {
    vi.spyOn(GameDig, 'query').mockResolvedValue({
      name: 'Hypixel',
      map: 'world',
      version: 'v1.0.0',
      password: false,
      maxplayers: 100,
      numplayers: 25,
      players: [{ name: 'Steve', ping: 50 }],
      bots: [],
      connect: 'mc.hypixel.net',
      ping: 42,
      raw: {},
    } as any)

    const options = {
      type: 'game',
      host: 'localhost',
      metrics: {
        metric1: {
          description: 'metric 1 desc',
          value: 'players[0].ping',
          labels: {
            label1: "players[0].ping",
          }
        },
      },
    }

    registerMetrics('my_server', options)
    await loadMetrics('my_server', options)
    const resp = await register.metrics()

    expect(resp).toContain('gamedig_game_my_server_metric1{label1="50"} 50')
  })

  it('labels custom metrics with js expression', async () => {
    vi.spyOn(GameDig, 'query').mockResolvedValue({
      name: 'Hypixel',
      map: 'world',
      version: 'v1.0.0',
      password: false,
      maxplayers: 100,
      numplayers: 25,
      players: [{ name: 'Steve', ping: 50 }],
      bots: [],
      connect: 'mc.hypixel.net',
      ping: 42,
      raw: {},
    } as any)

    const options = {
      type: 'game',
      host: 'localhost',
      metrics: {
        metric1: {
          description: 'metric 1 desc',
          value: 'players[0].ping',
          labels: {
            label1: '(data) => { return data.players[0].ping * 100 }',
          }
        },
      },
    }

    registerMetrics('my_server', options)
    await loadMetrics('my_server', options)
    const resp = await register.metrics()

    expect(resp).toContain('gamedig_game_my_server_metric1{label1="5000"} 50')
  })

  it('handles error when getting invalid label value', async () => {
    vi.spyOn(GameDig, 'query').mockResolvedValue({
      name: 'Hypixel',
      map: 'world',
      version: 'v1.0.0',
      password: false,
      maxplayers: 100,
      numplayers: 25,
      players: [{ name: 'Steve', ping: 50 }],
      bots: [],
      connect: 'mc.hypixel.net',
      ping: 42,
      raw: {},
    } as any)

    const options = {
      type: 'game',
      host: 'localhost',
      metrics: {
        metric1: {
          description: 'metric 1 desc',
          value: 'players[0].ping',
          labels: {
            label1: '(data) => { return this is an error }',
          }
        },
      },
    }

    registerMetrics('my_server', options)
    await loadMetrics('my_server', options)
    const resp = await register.metrics()

    expect(resp).toContain('gamedig_game_my_server_metric1{label1="undefined"} 50')
  })
})
