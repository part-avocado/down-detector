import type { CheckResult, Service, ServiceStatus } from './types';

export async function getServiceById(db: D1Database, id: string): Promise<Service | null> {
  const result = await db
    .prepare('SELECT id, name, category, url FROM services WHERE id = ?')
    .bind(id)
    .first<Service>();
  return result ?? null;
}

export async function getAllServices(db: D1Database): Promise<Service[]> {
  const { results } = await db
    .prepare('SELECT id, name, category, url FROM services ORDER BY category, name')
    .all<Service>();
  return results;
}

export async function getLatestCheckPerService(
  db: D1Database
): Promise<Map<string, CheckResult>> {
  const { results } = await db
    .prepare(`
      SELECT c.*
      FROM checks c
      INNER JOIN (
        SELECT service_id, MAX(checked_at) AS max_checked
        FROM checks
        GROUP BY service_id
      ) latest ON c.service_id = latest.service_id AND c.checked_at = latest.max_checked
    `)
    .all<CheckResult>();
  return new Map(results.map(r => [r.service_id, r]));
}

export async function getRecentChecks(
  db: D1Database,
  serviceId: string,
  limit = 10
): Promise<CheckResult[]> {
  const { results } = await db
    .prepare('SELECT * FROM checks WHERE service_id = ? ORDER BY checked_at DESC LIMIT ?')
    .bind(serviceId, limit)
    .all<CheckResult>();
  return results;
}

export async function insertChecks(
  db: D1Database,
  checks: Omit<CheckResult, 'id'>[]
): Promise<void> {
  await db.batch(
    checks.map(c =>
      db
        .prepare(`
          INSERT INTO checks (service_id, checked_at, status, latency_ms, status_code, error)
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .bind(
          c.service_id,
          c.checked_at,
          c.status,
          c.latency_ms ?? null,
          c.status_code ?? null,
          c.error ?? null
        )
    )
  );
}

export async function pruneOldChecks(db: D1Database): Promise<void> {
  const cutoff = Math.floor(Date.now() / 1000) - 7 * 86400;
  await db.prepare('DELETE FROM checks WHERE checked_at < ?').bind(cutoff).run();
}

export async function buildServiceStatuses(db: D1Database): Promise<ServiceStatus[]> {
  const [services, latestMap] = await Promise.all([
    getAllServices(db),
    getLatestCheckPerService(db),
  ]);
  const histories = await Promise.all(
    services.map(s => getRecentChecks(db, s.id, 10))
  );
  return services.map((service, i) => ({
    service,
    latest: latestMap.get(service.id) ?? null,
    history: histories[i],
  }));
}
