import { getConfig } from '@/config'
import { loadMetrics } from '@/metrics'
import { getLogger } from '@/utility.js'
import express from 'express'
import { register } from 'prom-client'

const app = express()

app.get('/', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType)
    res.end('Metrics are at /metrics')
  } catch (ex) {
    getLogger().error(ex)
    res.status(500).end(ex.toString())
  }
})

app.get('/metrics', async (req, res) => {
  try {
    await Promise.all(Object.entries(getConfig().games).map(([name, cfg]) => loadMetrics(name, cfg)))
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
  } catch (ex) {
    getLogger().error(ex)
    res.status(500).end(ex.toString())
  }
})

export default app
