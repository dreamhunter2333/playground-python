import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { v4 as uuidv4 } from 'uuid';

const app = new Hono().basePath('/api')

app.post('/share', async (c) => {
  const { code } = await c.req.json()
  const uuid = uuidv4();
  const { success } = await c.env.DB.prepare(
    `INSERT INTO shares (uuid, code) VALUES (?, ?)`
  ).bind(uuid, code).run();
  if (!success) {
    return c.json({ "error": "Failed to save share" }, 500)
  }
  return c.json({ "uuid": uuid })
})


app.get('/share/:uuid', async (c) => {
  const { uuid } = c.req.param()
  const row = await c.env.DB.prepare(
    `SELECT * FROM shares WHERE uuid = ?`
  ).bind(uuid).first();
  if (!row) {
    return c.json({ "error": "Share not found" }, 404)
  }
  return c.json(row)
})

export const onRequest = handle(app)
