import { getConfig } from '@/config.js'
import { registerMetricsForConfig } from '@/metrics.js'
import app from '@/routes'
import { GameDig } from 'gamedig'
import request from 'supertest'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

// @ts-ignore
vi.mock(import('@/config'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getConfig: () => ({
      games: {
        hypixel: {
          type: 'minecraft',
          host: 'mc.hypixel.net',
        },
      },
    }),
  }
})


describe('GET /', () => {
  it('returns index page', async () => {

    const res = await request(app).get('/')

    expect(res.status).toBe(200)
    expect(res.type).toBe('text/plain')
  })
})

describe('GET /metrics', () => {
  it('returns metrics', async () => {

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

    registerMetricsForConfig(getConfig())


    const res = await request(app).get('/metrics')

    expect(res.status).toBe(200)
    expect(res.type).toBe('text/plain') // Because of `res.type('text')`
    expect(res.text).toContain('gamedig_minecraft_hypixel_players_online 25')
    expect(res.text).toContain('gamedig_minecraft_hypixel_players_max 100')
    expect(res.text).toContain('gamedig_minecraft_hypixel_ping_milliseconds 42')
    expect(res.text).toContain('gamedig_minecraft_hypixel_up 1')
    expect(res.text).toContain('gamedig_minecraft_hypixel_requires_password 0')
    expect(res.text).toContain('gamedig_minecraft_hypixel_version{version="v1.0.0"} 1')
  })

})
