import { getConfig } from '@/config'
import { registerMetricsForConfig } from '@/metrics'
import {
  getLogger,
} from '@/utility'
import * as process from 'process'
import app from '@/routes'

const PORT = process.env.PORT || 9339
const HOST = process.env.HOST || "0.0.0.0"

registerMetricsForConfig(getConfig())

if (Object.keys(getConfig().games).length === 0) {
  getLogger().error('No games found to query, exiting')
  process.exit(1)
} else {
  app.listen(PORT, HOST,() => {
    /* c8 ignore next startup callback */
    getLogger().log(`Server is running at http://${HOST}:${PORT}`)
  })
}
