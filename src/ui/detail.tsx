import type { CheckResult, CheckStatus, Service } from '../types';
import { CHECK_TIMEOUT_MS, DEGRADED_LATENCY_MS, UNSURE_STATUS_CODES } from '../checker';
import type { StatusNotification } from '../status-page';
import { getStatusPageUrl } from '../status-page';
import { CSS } from './styles';

const degradedSec = DEGRADED_LATENCY_MS / 1000;
const timeoutSec = CHECK_TIMEOUT_MS / 1000;

interface DetailProps {
  service: Service;
  checks: CheckResult[];
  notifications: StatusNotification[];
  generatedAt: Date;
}

function explainCheck(check: CheckResult): { label: string; reason: string } {
  const { status, status_code, latency_ms, error } = check;

  if (status === 'up') {
    return {
      label: 'operational',
      reason: `this responded with HTTP ${status_code} in ${latency_ms}ms. Both the status code (2xx/3xx) and response time (under ${degradedSec} seconds) are within normal thresholds.`,
    };
  }

  if (status === 'down') {
    if (!status_code) {
      if (latency_ms != null && latency_ms >= CHECK_TIMEOUT_MS) {
        return { label: 'timed-out', reason: `Request timed out as no response was received within the ${timeoutSec} second limit. This typically indicates a network-level issue or the server is not accepting connections.` };
      }
      return { label: 'down(?)', reason: `Connection failed before a response could be received. Error: ${error ?? 'unknown'}.` };
    }
    return { label: 'down', reason: `Responded HTTP ${status_code} in ${latency_ms}ms. 5xx responses indicate a server-side error, therefore the service is classified as down.` };
  }

  if (status === 'unsure') {
    return {
      label: 'unsure',
      reason: `responded with HTTP ${status_code} in ${latency_ms}ms. This code means the server is reachable and running, but it's intentionally rejecting our probe — so we can't confirm whether the service is healthy for real users.`,
    };
  }

  // degraded
  if (status_code && status_code >= 400) {
    return {
      label: 'degraded',
      reason: `responded with HTTP ${status_code} in ${latency_ms}ms. 4xx responses indicate a client or authentication issue at the endpoint being checked. The server is reachable but not behaving normally.`,
    };
  }
  return {
    label: 'slow',
    reason: `responded HTTP ${status_code} in ${latency_ms}ms. The response was successful but took ${degradedSec} seconds or longer, indicating slow or overloaded infra.`,
  };
}

function formatTime(ts: number): string {
  return new Date(ts * 1000).toUTCString().replace(' GMT', '');
}

function timeAgo(ts: number): string {
  const secs = Math.floor(Date.now() / 1000) - ts;
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function CheckRow({ check }: { check: CheckResult }) {
  const s: CheckStatus | 'unknown' = check.status;
  const code = check.status_code != null ? String(check.status_code) : check.error ? 'ERR' : '—';
  const latency = check.latency_ms != null ? `${check.latency_ms}ms` : '—';
  return (
    <div class="check-item">
      <span class={`sdot ${s}`} />
      <span class={`check-code ${s}`}>{code}</span>
      <span class="check-latency">{latency}</span>
      {check.error && <span class="check-error">{check.error}</span>}
      <span class="check-time" title={formatTime(check.checked_at)}>{timeAgo(check.checked_at)}</span>
    </div>
  );
}

type Severity = 'critical' | 'partial' | 'degraded' | 'maintenance';

function getSeverity(type: string, impact: string): Severity {
  if (type === 'maintenance') return 'maintenance';
  const imp = (impact ?? '').toLowerCase();
  if (imp === 'critical') return 'critical';
  if (imp === 'major' || imp === 'high') return 'partial';
  return 'degraded';
}

const SEV_LABEL: Record<Severity, string> = {
  critical:    'Outage',
  partial:     'Partial Outage',
  degraded:    'Degraded',
  maintenance: 'Maintenance',
};

const SEV_ICON: Record<Severity, string> = {
  critical:    '▲',
  partial:     '▲',
  degraded:    '▲',
  maintenance: '⚙',
};

function NotificationCard({ n }: { n: StatusNotification }) {
  const sev = getSeverity(n.type, n.impact);
  const scheduledDate = n.scheduledFor
    ? new Date(n.scheduledFor).toUTCString().replace(':00 GMT', ' UTC')
    : null;

  return (
    <div class={`notif-card notif-sev-${sev}`}>
      <div class="notif-head">
        <span class={`notif-badge notif-badge-${sev}`}>{SEV_ICON[sev]} {SEV_LABEL[sev]}</span>
        <span class="notif-head-status">{n.status}</span>
      </div>
      <div class="notif-title">{n.title}</div>
      {n.body && <div class="notif-body">{n.body}</div>}
      <div class="notif-foot">
        {scheduledDate && <span class="notif-foot-scheduled">Scheduled {scheduledDate}</span>}
        <a href={n.url} class="notif-foot-link" target="_blank" rel="noopener">Details ↗</a>
      </div>
    </div>
  );
}

export function DetailPage({ service, checks, notifications, generatedAt }: DetailProps) {
  const latest = checks[0] ?? null;
  const explanation = latest ? explainCheck(latest) : null;
  const s = latest?.status ?? 'unknown';
  const ruleHit =
    latest?.status === 'up' || latest?.status === 'degraded' || latest?.status === 'down' || latest?.status === 'unsure'
      ? latest.status
      : null;
  const statusPageUrl = getStatusPageUrl(service.id);

  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{service.name} | status</title>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </head>
      <body>
        <div class="page">
          <a href="/" class="back">← All services</a>

          <div class="detail-header">
            <div class="detail-top">
              <span class={`sdot ${s}`} />
              <span class="detail-name">{service.name}</span>
            </div>
            <div class="detail-url">{service.url}</div>
            {statusPageUrl && (
              <a href={statusPageUrl} class="detail-status-link" target="_blank" rel="noopener">
                official status page ↗
              </a>
            )}
          </div>

          <div class="explain">
            {explanation ? (
              <>
                <div class={`explain-label ${s}`}>{explanation.label}</div>
                <div class="explain-reason">{explanation.reason}</div>
              </>
            ) : (
              <>
                <div class="explain-label unknown">No data</div>
                <div class="explain-reason">No checks have been recorded yet for this service.</div>
              </>
            )}
            <div class="explain-rules">
              <div class={ruleHit === 'up' ? 'rule rule-hit rule-hit-up' : 'rule'}>
                <b>operational</b>: it works! the endpoint responds with a HTTP response code of 2xx or 3xx, and has a response time of less than {degradedSec} seconds.
              </div>
              <div class={ruleHit === 'degraded' ? 'rule rule-hit rule-hit-degraded' : 'rule'}>
                <b>degraded</b>: it works... ish. the endpoint responds with a HTTP response code of 4xx, or response time {degradedSec} seconds or longer.
              </div>
              <div class={ruleHit === 'down' ? 'rule rule-hit rule-hit-down' : 'rule'}>
                <b>down</b>: it does not work! D: the endpoint responds with a HTTP 5xx response code, experiences a connection error, or timed-out (no response within {timeoutSec} seconds).
              </div>
              <div class={ruleHit === 'unsure' ? 'rule rule-hit rule-hit-unsure' : 'rule'}>
                <b>unsure</b>: the server is reachable but intentionally rejecting our probe (HTTP {[...UNSURE_STATUS_CODES].sort((a,b)=>a-b).join('/')}). we can't confirm the service is healthy for real users.
              </div>
              <div class="rule">checks run every 10 minutes via HTTP HEAD request</div>
            </div>
          </div>

          {notifications.length > 0 && (
            <div class="notif-section">
              {notifications.map((n, i) => <NotificationCard key={i} n={n} />)}
            </div>
          )}

          {checks.length > 0 && (
            <>
              <div class="check-list-heading">Recent checks</div>
              {checks.map(c => <CheckRow key={c.id} check={c} />)}
            </>
          )}

          <div class="footer">
            <div class="footer-line">
              Updated {generatedAt.toUTCString()}
            </div>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          setInterval(async () => {
            try {
              const res = await fetch(location.href);
              const html = await res.text();
              const doc = new DOMParser().parseFromString(html, 'text/html');
              document.querySelector('.page').replaceWith(doc.querySelector('.page'));
            } catch {}
          }, 30000);
        `}} />
      </body>
    </html>
  );
}
