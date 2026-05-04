import type { CheckResult, CheckStatus, Service } from './types';

/** AbortController cutoff; timeouts count as down. */
export const CHECK_TIMEOUT_MS = 10000;

/** Successful 2xx/3xx slower than this (edge-to-remote) counts as degraded. */
export const DEGRADED_LATENCY_MS = 5000;

/** 4xx codes where the service is clearly reachable but rejecting our probe — classified as unsure rather than degraded. */
export const UNSURE_STATUS_CODES = new Set([401, 403, 405, 429]);

async function probe(service: Service, method: 'HEAD' | 'GET'): Promise<Omit<CheckResult, 'id'>> {
  const checkedAt = Math.floor(Date.now() / 1000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
  const start = Date.now();

  try {
    const response = await fetch(service.url, {
      method,
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
    } else if (UNSURE_STATUS_CODES.has(statusCode)) {
      status = 'unsure';
    } else if (statusCode >= 400 || latency >= DEGRADED_LATENCY_MS) {
      status = 'degraded';
    } else {
      status = 'up';
    }

    return { service_id: service.id, checked_at: checkedAt, status, latency_ms: latency, status_code: statusCode, error: null };
  } catch (err) {
    clearTimeout(timer);
    const latency = Date.now() - start;
    const isTimeout = (err instanceof Error && err.name === 'AbortError') || latency >= CHECK_TIMEOUT_MS;
    return {
      service_id: service.id,
      checked_at: checkedAt,
      status: 'down',
      latency_ms: isTimeout ? CHECK_TIMEOUT_MS : null,
      status_code: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function checkService(service: Service): Promise<Omit<CheckResult, 'id'>> {
  const result = await probe(service, 'HEAD');
  // HEAD was rejected or not supported — retry with GET for a real signal
  if (result.status === 'unsure') {
    return probe(service, 'GET');
  }
  return result;
}

export async function checkAllServices(services: Service[]): Promise<Omit<CheckResult, 'id'>[]> {
  return Promise.all(services.map(checkService));
}
