export type CheckStatus = 'up' | 'degraded' | 'down' | 'unsure';

/** Strongest vendor-reported issue level for a service. */
export type NotifLevel = 'outage' | 'partial' | 'degraded' | 'maintenance';

export interface Service {
  id: string;
  name: string;
  category: string;
  url: string;
}

export interface CheckResult {
  id: number;
  service_id: string;
  checked_at: number;
  status: CheckStatus;
  latency_ms: number | null;
  status_code: number | null;
  error: string | null;
}

export interface ServiceStatus {
  service: Service;
  latest: CheckResult | null;
  history: CheckResult[];
}

export interface Env {
  DB: D1Database;
}
