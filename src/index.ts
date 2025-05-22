import { getConfig } from '@/config.js'
import { registerMetricsForConfig } from '@/metrics'
import {
  getLogger,
} from '@/utility'
import * as process from 'process'
import app from '@/routes'

const PORT = process.env.PORT || 3000

registerMetricsForConfig(getConfig())

if (Object.keys(getConfig().games).length === 0) {
  getLogger().error('No games found to query, exiting')
  process.exit(1)
} else {
  app.listen(PORT, () => {
    getLogger().info(`Server is running at http://localhost:${PORT}`)
  })
}
