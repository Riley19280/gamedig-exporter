import { getConfig } from '@/config'
import { registerMetricsForConfig } from '@/metrics'
import {
  getLogger,
} from '@/utility'
import app from '@/routes'

const PORT = process.env.PORT || 9339
const HOST = process.env.HOST || "0.0.0.0"

registerMetricsForConfig(getConfig())

let server

if (Object.keys(getConfig().games).length === 0) {
  getLogger().error('No configuration found, exiting')
  process.exit(1)
} else {
  getLogger().log(`Starting server`)
  server = app.listen(PORT, HOST,() => {
    /* c8 ignore next startup callback */
    getLogger().log(`Server is running at http://${HOST}:${PORT}`)
  })
}

/* c8 ignore start docker exit handling */
function shutdown() {
  server.close(() => {
    getLogger().log(`Server is stopping...`)
    process.exit(0);
  });
}
/* c8 ignore end docker exit handling */

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
