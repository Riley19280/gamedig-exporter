import {
  CliArgsSchema,
  Config,
} from '@/types'
import { getLogger } from '@/utility'
import commandLineArgs from 'command-line-args'
import process from 'process'

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

  const cliArgs = getCliArgs()

  if (!('name' in cliArgs) && !('type' in cliArgs) && !('host' in cliArgs)) {
    getLogger().debug('No configuration found in CLI Args')
    return config
  }

  const result = CliArgsSchema.safeParse(getCliArgs())

  if (result.success) {
    const parsedConfig = result.data
    for (let i = 0; i < parsedConfig.name.length; i++) {
      const name = parsedConfig.name[i]
      const type = parsedConfig.type[i]
      const host = parsedConfig.host[i]
      config.games[name] = {
        type,
        host,
      }
    }
  } else {
    getLogger().warn('Parsed CLI args were not valid')

    const errors = result.error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
    getLogger().warn(errors)
    process.exit(1)
  }

  return config
}
