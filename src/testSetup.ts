import { clearCachedCliArgs } from '@/cli.js'
import { clearCachedConfig } from '@/config.js'
import { register } from 'prom-client'
import { beforeEach } from 'vitest'

beforeEach(() => {
  register.clear()
  // clearCachedConfig()
  // clearCachedCliArgs()
})
