import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jsxRenderer } from 'hono/jsx-renderer';
import type { CheckStatus, Env } from './types';
import { buildServiceStatuses, getAllServices, getRecentChecks, getServiceById, insertChecks, pruneOldChecks } from './db';
import { checkAllServices } from './checker';
import { fetchNotifications } from './status-page';
import { StatusPage } from './ui/page';
import { DetailPage } from './ui/detail';

const app = new Hono<{ Bindings: Env }>();

app.use('*', jsxRenderer());
app.use('/api/*', cors());

// ── HTML pages ────────────────────────────────────────────────────────────────

app.get('/', async (c) => {
  const statuses = await buildServiceStatuses(c.env.DB);
  return c.html('<!DOCTYPE html>' + <StatusPage statuses={statuses} generatedAt={new Date()} />);
});

app.get('/service/:id', async (c) => {
  const id = c.req.param('id');
  const [service, checks, notifications] = await Promise.all([
    getServiceById(c.env.DB, id),
    getRecentChecks(c.env.DB, id, 40),
    fetchNotifications(id),
  ]);
  if (!service) return c.notFound();
  return c.html('<!DOCTYPE html>' + <DetailPage service={service} checks={checks} notifications={notifications} generatedAt={new Date()} />);
});

// ── JSON API ──────────────────────────────────────────────────────────────────

app.get('/api', (c) => c.json({
  version: 1,
  endpoints: [
    { method: 'GET',  path: '/api/services',     description: 'List all monitored services' },
    { method: 'GET',  path: '/api/services/:id', description: 'Single service with latest check and 10-check history' },
    { method: 'GET',  path: '/api/checks',       description: 'All services with status. Filter: ?status=up|degraded|down' },
    { method: 'POST', path: '/api/trigger',      description: 'Run all health checks immediately and return results' },
  ],
}));

app.get('/api/services', async (c) => {
  const services = await getAllServices(c.env.DB);
  return c.json(services);
});

app.get('/api/services/:id', async (c) => {
  const id = c.req.param('id');
  const [service, checks] = await Promise.all([
    getServiceById(c.env.DB, id),
    getRecentChecks(c.env.DB, id, 10),
  ]);
  if (!service) return c.json({ error: 'Service not found' }, 404);
  return c.json({ service, latest: checks[0] ?? null, history: checks });
});

app.get('/api/checks', async (c) => {
  const statusFilter = c.req.query('status') as CheckStatus | undefined;
  const statuses = await buildServiceStatuses(c.env.DB);
  const result = statusFilter
    ? statuses.filter(s => s.latest?.status === statusFilter)
    : statuses;
  return c.json(result);
});

app.post('/api/trigger', async (c) => {
  const services = await getAllServices(c.env.DB);
  const results = await checkAllServices(services);
  await insertChecks(c.env.DB, results);
  return c.json({ checked: results.length, results });
});

async function runChecks(env: Env): Promise<void> {
  const services = await getAllServices(env.DB);
  const results = await checkAllServices(services);
  await Promise.all([
    insertChecks(env.DB, results),
    pruneOldChecks(env.DB),
  ]);
  console.log(`[cron] Checked ${results.length} services`);
}

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runChecks(env));
  },
} satisfies ExportedHandler<Env>;
