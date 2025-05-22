import { Config } from '@/types.js'
import {
  createMetricPrefix,
  findMetric,
  getLogger,
} from '@/utility'
import {
  GameDig,
  QueryOptions,
  QueryResult,
} from 'gamedig'
import {
  Gauge,
  register,
} from 'prom-client'

export async function loadMetrics(name, options: QueryOptions) {
  const prefix = createMetricPrefix(name, options.type)

  const data: QueryResult|null = await GameDig.query(options).then((state) => {
    return state
  })
  .catch((err) => {
    getLogger().warn(`Unable to query server for ${name} type:${options.type} host:${options.host}`)
    getLogger().error(err)
    return null
  })

  if(!data) {
    findMetric(`${prefix}_up`).set({}, 0)
    return
  }

  findMetric(`${prefix}_players_online`).set({}, data.numplayers)
  findMetric(`${prefix}_players_max`).set({}, data.maxplayers)
  findMetric(`${prefix}_ping_milliseconds`).set({}, data.ping)
  findMetric(`${prefix}_up`).set({}, 1)
  findMetric(`${prefix}_requires_password`).set({}, data.password ? 1 : 0)
  findMetric(`${prefix}_version`).set({version: data.version}, 1)
}

export function registerMetricsForConfig(config: Config) {
  Object.entries(config.games).map(([name, cfg]) => registerMetrics(name, cfg as QueryOptions))
}

export function registerMetrics(name, options: QueryOptions) {
  const prefix = createMetricPrefix(name, options.type)

  const playersOnline = new Gauge({
    name: `${prefix}_players_online`,
    help: 'Current number of players online on the server',
    labelNames: [],
  })

  const maxPlayers = new Gauge({
    name: `${prefix}_players_max`,
    help: 'Maximum number of players the server allows',
    labelNames: [],
  })

  const serverPing = new Gauge({
    name: `${prefix}_ping_milliseconds`,
    help: 'Ping to the Minecraft server in milliseconds',
    labelNames: [],
  })

  const serverUp = new Gauge({
    name: `${prefix}_up`,
    help: 'Whether the server is reachable (1 for up, 0 for down)',
    labelNames: [],
  })

  const passwordProtected = new Gauge({
    name: `${prefix}_requires_password`,
    help: 'Whether the server is password protected (1 for yes, 0 for no)',
    labelNames: [],
  })

  const versionInfo = new Gauge({
    name: `${prefix}_version`,
    help: 'Static gauge with version label for filtering',
    labelNames: ['version'],
  })

  return {
    playersOnline,
    maxPlayers,
    serverPing,
    serverUp,
    passwordProtected,
    versionInfo,
  }
}
