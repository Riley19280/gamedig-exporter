import {
  getCliArgs,
  parseCliOptionsToConfig,
} from '@/cli'
import {
  Config,
  ZConfig,
} from '@/types.js'
import { getLogger } from '@/utility'
import fs from 'fs'
import path from 'path'
import process from 'process'
import YAML from 'yaml'

let _config = null

export function getConfig(): Config {
  if (_config) {
    return _config
  }

  const cliArgs = getCliArgs()

  if (cliArgs.config) {
    getLogger().debug(`Loading config file ${cliArgs.config}`)
    _config = loadConfigFromFile(cliArgs.config)
    return _config
  } else {
    getLogger().debug(`No config file provided in CLI args`)
  }

  const defaultPath = path.join(process.cwd(), 'config.yml')
  getLogger().debug(`Checking for default config file at ${defaultPath}`)
  if (fs.existsSync(defaultPath)) {
    getLogger().debug(`Loading config file ${defaultPath}`)
    _config = loadConfigFromFile(defaultPath)
    return _config
  } else {
    getLogger().debug(`No config default config file found`)
  }

  getLogger().debug(`Loading config file from CLI args`)
  _config = parseCliOptionsToConfig()
  return _config
}

export function clearCachedConfig(){
  _config = null
}

export function loadConfigFromFile(filepath: string): Config {
  const file = fs.readFileSync(filepath, 'utf8')
  const data = YAML.parse(file)

  try {
    return ZConfig.parse(data)
  } catch (err) {
    throw err
    // if (err instanceof z.ZodError) {
    // }
  }

}
