export interface StatusNotification {
  type: 'incident' | 'maintenance';
  title: string;
  body: string;
  status: string;
  impact: 'none' | 'minor' | 'major' | 'critical' | string;
  url: string;
  scheduledFor?: string;
}

const STATUS_PAGE_HOMEPAGES: Partial<Record<string, string>> = {
  'github-web':   'https://www.githubstatus.com',
  'github-api':   'https://www.githubstatus.com',
  'gitlab':       'https://status.gitlab.com',
  'gcp-console':  'https://status.cloud.google.com',
  'googleapis':   'https://status.cloud.google.com',
  'azure-portal': 'https://azure.status.microsoft',
  'azure-mgmt':   'https://azure.status.microsoft',
  'aws':          'https://health.aws.amazon.com',
  'cloudflare':   'https://www.cloudflarestatus.com',
  'fastly':       'https://status.fastly.com',
  'stripe-api':   'https://status.stripe.com',
  'vercel':       'https://www.vercel-status.com',
  'npm-registry': 'https://status.npmjs.org',
  'pypi':         'https://status.python.org',
  'docker-hub':   'https://www.dockerstatus.com',
  'fly-io':       'https://status.fly.io',
  'render':       'https://status.render.com',
  'openai':       'https://status.openai.com',
  'anthropic':    'https://status.anthropic.com',
};

export function getStatusPageUrl(serviceId: string): string | null {
  return STATUS_PAGE_HOMEPAGES[serviceId] ?? null;
}

type ApiType = 'statuspage' | 'gcp';

const STATUS_APIS: Partial<Record<string, { url: string; type: ApiType }>> = {
  'github-web':   { url: 'https://www.githubstatus.com/api/v2/summary.json',     type: 'statuspage' },
  'github-api':   { url: 'https://www.githubstatus.com/api/v2/summary.json',     type: 'statuspage' },
  'gitlab':       { url: 'https://status.gitlab.com/api/v2/summary.json',        type: 'statuspage' },
  'gcp-console':  { url: 'https://status.cloud.google.com/incidents.json',       type: 'gcp' },
  'googleapis':   { url: 'https://status.cloud.google.com/incidents.json',       type: 'gcp' },
  'cloudflare':   { url: 'https://www.cloudflarestatus.com/api/v2/summary.json', type: 'statuspage' },
  'fastly':       { url: 'https://status.fastly.com/api/v2/summary.json',        type: 'statuspage' },
  'vercel':       { url: 'https://www.vercel-status.com/api/v2/summary.json',    type: 'statuspage' },
  'npm-registry': { url: 'https://status.npmjs.org/api/v2/summary.json',         type: 'statuspage' },
  'pypi':         { url: 'https://status.python.org/api/v2/summary.json',        type: 'statuspage' },
  'docker-hub':   { url: 'https://www.dockerstatus.com/api/v2/summary.json',     type: 'statuspage' },
  'fly-io':       { url: 'https://status.fly.io/api/v2/summary.json',            type: 'statuspage' },
  'render':       { url: 'https://status.render.com/api/v2/summary.json',        type: 'statuspage' },
  'openai':       { url: 'https://status.openai.com/api/v2/summary.json',        type: 'statuspage' },
  'anthropic':    { url: 'https://status.anthropic.com/api/v2/summary.json',     type: 'statuspage' },
};

// ── Atlassian Statuspage ───────────────────────────────────────────────────────

interface SPSummary {
  incidents: SPIncident[];
  scheduled_maintenances: SPMaintenance[];
}
interface SPIncident {
  name: string;
  status: string;
  impact: string;
  shortlink: string;
  incident_updates: { body: string }[];
}
interface SPMaintenance {
  name: string;
  status: string;
  impact: string;
  shortlink: string;
  scheduled_for: string;
  incident_updates: { body: string }[];
}

function parseStatuspage(data: SPSummary): StatusNotification[] {
  const out: StatusNotification[] = [];
  for (const inc of data.incidents ?? []) {
    if (inc.status === 'resolved' || inc.status === 'postmortem') continue;
    out.push({
      type: 'incident',
      title: inc.name,
      body: inc.incident_updates?.[0]?.body ?? '',
      status: inc.status.replace(/_/g, ' '),
      impact: inc.impact,
      url: inc.shortlink,
    });
  }
  for (const maint of data.scheduled_maintenances ?? []) {
    if (maint.status === 'completed') continue;
    out.push({
      type: 'maintenance',
      title: maint.name,
      body: maint.incident_updates?.[0]?.body ?? '',
      status: maint.status.replace(/_/g, ' '),
      impact: maint.impact,
      url: maint.shortlink,
      scheduledFor: maint.scheduled_for,
    });
  }
  return out;
}

// ── Google Cloud ──────────────────────────────────────────────────────────────

interface GCPIncident {
  external_desc: string;
  begin: string;
  end: string | null;
  severity: string;
  uri: string;
  updates: { when: string; text: string }[];
}

function parseGcp(data: GCPIncident[]): StatusNotification[] {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return (data ?? [])
    .filter(inc => !inc.end || new Date(inc.end).getTime() > cutoff)
    .map(inc => {
      const latestUpdate = inc.updates?.[inc.updates.length - 1];
      // GCP update text can contain markdown — strip it to first paragraph
      const rawBody = latestUpdate?.text ?? '';
      const body = rawBody.replace(/^#+\s.*\n?/gm, '').trim().split('\n')[0] ?? '';
      return {
        type: 'incident' as const,
        title: inc.external_desc,
        body,
        status: inc.end ? 'resolved' : 'investigating',
        impact: inc.severity ?? 'medium',
        url: inc.uri ?? 'https://status.cloud.google.com/',
      };
    });
}

// ── Public interface ──────────────────────────────────────────────────────────

export async function fetchNotifications(serviceId: string): Promise<StatusNotification[]> {
  const config = STATUS_APIS[serviceId];
  if (!config) return [];

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(config.url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      // Use Cloudflare's cache with a short TTL so we're not hammering upstream
      cf: { cacheTtl: 120, cacheEverything: true },
    } as RequestInit);
    clearTimeout(timer);

    if (!res.ok) return [];
    const data: unknown = await res.json();

    if (config.type === 'statuspage') return parseStatuspage(data as SPSummary);
    if (config.type === 'gcp')        return parseGcp(data as GCPIncident[]);
    return [];
  } catch {
    return [];
  }
}
