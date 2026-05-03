import type { CheckResult, CheckStatus, Service } from './types';

const TIMEOUT_MS = 5000;
const DEGRADED_LATENCY_MS = 3000;

export async function checkService(service: Service): Promise<Omit<CheckResult, 'id'>> {
  const checkedAt = Math.floor(Date.now() / 1000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const start = Date.now();

  try {
    const response = await fetch(service.url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'DownDetector/1.0' },
    });
    clearTimeout(timer);
    const latency = Date.now() - start;
    const statusCode = response.status;

    let status: CheckStatus;
    if (statusCode >= 500) {
      status = 'down';
    } else if (statusCode >= 400 || latency > DEGRADED_LATENCY_MS) {
      status = 'degraded';
    } else {
      status = 'up';
    }

    return { service_id: service.id, checked_at: checkedAt, status, latency_ms: latency, status_code: statusCode, error: null };
  } catch (err) {
    clearTimeout(timer);
    const latency = Date.now() - start;
    const isTimeout = (err instanceof Error && err.name === 'AbortError') || latency >= TIMEOUT_MS;
    return {
      service_id: service.id,
      checked_at: checkedAt,
      status: 'down',
      latency_ms: isTimeout ? TIMEOUT_MS : null,
      status_code: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function checkAllServices(services: Service[]): Promise<Omit<CheckResult, 'id'>[]> {
  return Promise.all(services.map(checkService));
}
