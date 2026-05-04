import type { CheckStatus, NotifLevel, ServiceStatus } from '../types';

function HistoryBars({ history }: { history: { status: CheckStatus }[] }) {
  // 10 slots: index 0 = oldest (left), index 9 = newest (right)
  const slots = Array.from({ length: 10 }, (_, i) => {
    const check = history[9 - i];
    return check ? check.status : 'unknown';
  });
  return (
    <div class="bars" title="Last 10 checks — oldest left, newest right">
      {slots.map((s, i) => {
        const opacity = (0.12 + (i / 9) * 0.88).toFixed(2);
        return <span key={i} class={`bar ${s}`} style={`opacity:${opacity}`} />;
      })}
    </div>
  );
}

function timeAgo(ts: number): string {
  const secs = Math.floor(Date.now() / 1000) - ts;
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

const NOTIF_TITLE: Record<NotifLevel, string> = {
  outage:      'Vendor reporting outage',
  partial:     'Vendor reporting partial outage',
  degraded:    'Vendor reporting degraded performance',
  maintenance: 'Vendor reporting scheduled maintenance',
};

export function ServiceRow({ ss, notifLevel }: { ss: ServiceStatus; notifLevel?: NotifLevel }) {
  const { service, latest, history } = ss;
  const s = latest?.status ?? 'unknown';
  const metaText = s === 'down' ? 'Down'
    : latest?.latency_ms != null ? `${latest.latency_ms}ms`
    : '—';
  const badgeChar = notifLevel === 'maintenance' ? '⚙' : '⚠';
  return (
    <a href={`/service/${service.id}`} class="service">
      <span
        class={`vendor-badge${notifLevel ? ` vendor-badge-${notifLevel}` : ''}`}
        title={notifLevel ? NOTIF_TITLE[notifLevel] : undefined}
      >{notifLevel ? badgeChar : ''}</span>
      <span class={`sdot ${s}`} />
      <span class="sname">{service.name}</span>
      <HistoryBars history={history} />
      <span class={`smeta ${s}`}>{metaText}</span>
      <span class="sage">{latest ? timeAgo(latest.checked_at) : '—'}</span>
    </a>
  );
}
