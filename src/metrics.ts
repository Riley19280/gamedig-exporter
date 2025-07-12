import { getConfig } from '@/config.js'
import { Config } from '@/types'
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
import _ from 'lodash'
import { Gauge } from 'prom-client'

export async function loadAllMetricsFromConfig() {
  return await Promise.all(Object.entries(getConfig().games).map(([name, cfg]) => loadMetrics(name, cfg)))
}

export async function loadMetrics(name, options: Config['games'][string]) {
  const prefix = createMetricPrefix(name, options.type)

  const data: QueryResult | null = await GameDig
    .query(options as QueryOptions)
    .then((state) => {
      return state
    })
    .catch((err) => {
      getLogger().warn(`Unable to query server for ${name} type:${options.type} host:${options.host}`)
      getLogger().error(err)
      return null
    })

  getLogger().debug(JSON.stringify(data, null, 4))

  if (!data) {
    findMetric(`${prefix}_up`).set({}, 0)
    return
  }

  findMetric(`${prefix}_players_online`).set({}, data.numplayers)
  findMetric(`${prefix}_players_max`).set({}, data.maxplayers)
  findMetric(`${prefix}_ping_milliseconds`).set({}, data.ping)
  findMetric(`${prefix}_up`).set({}, 1)
  findMetric(`${prefix}_requires_password`).set({}, data.password ? 1 : 0)
  findMetric(`${prefix}_version`).set({ version: data.version }, 1)

  loadCustomMetrics(name, options, data)
}

export function registerMetricsForConfig(config: Config) {
  Object.entries(config.games).map(([name, cfg]) => registerMetrics(name, cfg))
}

export function registerMetrics(name, options: Config['games'][string]) {
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

  // Custom Metrics
  Object.entries(options.metrics ?? {}).map(([metricName, metricConfig]) => {
    const prefix = createMetricPrefix(name, options.type)
    const fullMetricName = `${prefix}_${metricName}`

    new Gauge({
      name: fullMetricName,
      help: metricConfig.description,
      labelNames: Object.keys((metricConfig.labels ?? {})),
    })
  })
}


export function loadCustomMetrics(name, options: Config['games'][string], data: QueryResult) {
  if (!options.metrics) {
    return
  }

  Object.entries(options.metrics).map(([metricName, metricConfig]) => {
    const prefix = createMetricPrefix(name, options.type)
    const fullMetricName = `${prefix}_${metricName}`

    const metric = findMetric(fullMetricName)

    let value = (() => {
      const val = _.get(data, metricConfig.value, new Error('Not Found'))

      if (val instanceof Error) {
        try {
          return eval(`(${metricConfig.value})(data)`)
        } catch (e) {
          getLogger().error(e)
          return undefined
        }
      } else {
        return val
      }
    })()

    const labels = Object.entries(metricConfig.labels ?? {}).reduce((acc, [label, labelValue]) => {
      acc[label] = (() => {
        const val = _.get(data, labelValue, new Error(`Path ${labelValue} not found in data`))

        if (val instanceof Error) {
          try {
            return eval(`(${labelValue})(data)`)
          } catch (e) {
            getLogger().error(e)
            return undefined
          }
        } else {
          return val
        }
      })()

      return acc
    }, {})


    if (value) {
      // metric.labelNames = Object.keys((metricConfig.labels))
      metric.set(labels, value)
    }
  })
}
