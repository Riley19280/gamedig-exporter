import { clearCachedCliArgs } from '@/cli'
import { clearCachedConfig } from '@/config'
import { register } from 'prom-client'
import { beforeEach } from 'vitest'

beforeEach(() => {
  register.clear()
  // clearCachedConfig()
  // clearCachedCliArgs()
})
