
import { getCliArgs } from '@/cli'
import {
  LogLevel,
} from '@/types'
import { register } from 'prom-client'

export function createMetricPrefix(name: string, type: string) {
  return `gamedig_${type}_${name}`
}

export function findMetric(name: string) {
  const metric = register.getMetricsAsArray().find(m => m.name === name)

  if (!metric) {
    throw new Error(`Metric "${name}" not found`)
  }

  return metric
}

export function getLogger() {
  const cliArgs = getCliArgs()
  const level = cliArgs?.verbose?.filter(x => x).length ?? 0

  return {
    log: (...args: any[]) => console.log(...args),
    error: (...args: any[]) => level >= LogLevel.ERROR && console.error(...args),
    warn: (...args: any[]) => level >= LogLevel.WARN && console.warn(...args),
    info: (...args: any[]) => level >= LogLevel.INFO && console.info(...args),
    debug: (...args: any[]) => level >= LogLevel.DEBUG && console.debug(...args),
  }
}
