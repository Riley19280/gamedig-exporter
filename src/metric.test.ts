import { GameDig } from 'gamedig'
import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  loadMetrics,
  registerMetrics,
} from '@/metrics'
import {
  register,
} from 'prom-client'

describe('defineMetrics', () => {
  it('should create all expected Gauge metrics with correct names', () => {
    const options = { type: 'game', host: 'localhost' };

    registerMetrics('my_server', options);

    const expectedMetricNames = [
      'gamedig_game_my_server_players_online',
      'gamedig_game_my_server_players_max',
      'gamedig_game_my_server_ping_milliseconds',
      'gamedig_game_my_server_up',
      'gamedig_game_my_server_requires_password',
      'gamedig_game_my_server_version',
    ];

    const actualNames = register.getMetricsAsArray().map((m) => m.name);

    expect(actualNames).toEqual(expectedMetricNames);
  });
});

describe('loadMetrics', () => {
  it('sets up metric to 0 on query failure', async () => {
    vi.spyOn(GameDig, 'query').mockRejectedValue(new Error('Test Error'))

    const options = { type: 'game', host: 'localhost' };

    registerMetrics('my_server', options);
    await loadMetrics('my_server', options)
    const resp = await register.metrics()

    expect(resp).toContain('gamedig_game_my_server_up 0')
  });

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

    const options = { type: 'game', host: 'localhost' };

    registerMetrics('my_server', options);
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

    const options = { type: 'game', host: 'localhost' };

    registerMetrics('my_server', options);
    await loadMetrics('my_server', options)
    const resp = await register.metrics()

    expect(resp).toContain('gamedig_game_my_server_requires_password 0')
  })
})
