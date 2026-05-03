import type { CheckResult, CheckStatus, Service } from '../types';
import type { StatusNotification } from '../status-page';
import { getStatusPageUrl } from '../status-page';
import { CSS } from './styles';

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
      label: 'Operational',
      reason: `Responded HTTP ${status_code} in ${latency_ms}ms. Both the status code (2xx/3xx) and response time (under 3 seconds) are within normal thresholds.`,
    };
  }

  if (status === 'down') {
    if (!status_code) {
      if (latency_ms != null && latency_ms >= 4900) {
        return { label: 'Down', reason: 'Request timed out — no response was received within the 5 second limit. This typically indicates a network-level issue or the server is not accepting connections.' };
      }
      return { label: 'Down', reason: `Connection failed before a response could be received. Error: ${error ?? 'unknown'}.` };
    }
    return { label: 'Down', reason: `Responded HTTP ${status_code} in ${latency_ms}ms. 5xx responses indicate a server-side error, so the service is classified as down.` };
  }

  // degraded
  if (status_code && status_code >= 400) {
    return {
      label: 'Degraded',
      reason: `Responded HTTP ${status_code} in ${latency_ms}ms. 4xx responses indicate a client or authentication issue at the endpoint being checked — the server is reachable but not behaving normally.`,
    };
  }
  return {
    label: 'Degraded',
    reason: `Responded HTTP ${status_code} in ${latency_ms}ms. The response was successful but took longer than the 3 second threshold, indicating slow or overloaded infrastructure.`,
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

function NotificationCard({ n }: { n: StatusNotification }) {
  const impactLabels: Record<string, string> = {
    none: 'No impact', minor: 'Minor', major: 'Major', critical: 'Critical',
    low: 'Low', medium: 'Medium', high: 'High',
  };
  const impact = impactLabels[n.impact] ?? n.impact;
  const scheduledDate = n.scheduledFor
    ? new Date(n.scheduledFor).toUTCString().replace(':00 GMT', ' UTC')
    : null;
  const icon = n.type === 'incident' ? '▲' : '⚙';
  const label = n.type === 'incident' ? 'Incident' : 'Maintenance';

  return (
    <div class={`notif-card notif-${n.type}`}>
      <div class="notif-head">
        <span class={`notif-badge notif-badge-${n.type}`}>{icon} {label}</span>
        <span class="notif-head-status">{n.status}</span>
      </div>
      <div class="notif-title">{n.title}</div>
      {n.body && <div class="notif-body">{n.body}</div>}
      <div class="notif-foot">
        {impact !== 'No impact' && <span class="notif-foot-impact">{impact} impact</span>}
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
  const statusPageUrl = getStatusPageUrl(service.id);

  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{service.name} — Status</title>
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
                Official status page ↗
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
              <div class="rule"><b>Operational</b> — HTTP 2xx or 3xx, response time under 3s</div>
              <div class="rule"><b>Degraded</b> — HTTP 4xx, or response time 3s or more</div>
              <div class="rule"><b>Down</b> — HTTP 5xx, connection error, or timeout after 5s</div>
              <div class="rule">Checks run every 5 minutes via HTTP HEAD request</div>
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
