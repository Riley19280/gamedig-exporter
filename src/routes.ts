import { getConfig } from '@/config'
import {
  loadAllMetricsFromConfig,
  loadMetrics,
} from '@/metrics'
import { getLogger } from '@/utility'
import express from 'express'
import { register } from 'prom-client'

const app = express()

app.get('/', async (req, res) => {
    res.set('Content-Type', 'text.html')
    res.end('Metrics are at <a href="/metrics">/metrics</a>')
})

app.get('/metrics', async (req, res) => {
  try {
    await loadAllMetricsFromConfig()
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
  }
  catch (ex) {
    getLogger().error(ex)
    res.status(500).end(ex.toString())
  }
})

export default app
