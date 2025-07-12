import {
  CliArgsSchema,
  Config,
} from '@/types'
import { getLogger } from '@/utility'
import commandLineArgs from 'command-line-args'

const optionDefinitions = [
  { name: 'name', alias: 'n', type: String, multiple: true },
  { name: 'type', alias: 't', type: String, multiple: true },
  { name: 'host', alias: 'h', type: String, multiple: true },
  { name: 'verbose', alias: 'v', type: Boolean, multiple: true },
  { name: 'config', alias: 'c', type: String, multiple: false },
]

let _args = null

export function getCliArgs() {
  if (_args) {
    return _args
  }

  _args = commandLineArgs(optionDefinitions) ?? {}
  return _args
}

export function clearCachedCliArgs() {
  _args = null
}

export function parseCliOptionsToConfig(): Config {
  const config = {
    games: {},
  }

  try {
    const parsedConfig = CliArgsSchema.parse(getCliArgs())

    for (let i = 0; i < parsedConfig.name.length; i++) {
      const name = parsedConfig.name[i]
      const type = parsedConfig.type[i]
      const host = parsedConfig.host[i]
      config.games[name] = {
        type,
        host,
      }
    }
  } catch (e) {
    getLogger().warn('Unable to parse CLI arguments')
    getLogger().error(e)
  }

  return config
}
