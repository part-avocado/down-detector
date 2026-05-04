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
  // Source Control
  'github-web':      'https://www.githubstatus.com',
  'github-api':      'https://www.githubstatus.com',
  'gitlab':          'https://status.gitlab.com',
  'bitbucket':       'https://status.atlassian.com',
  'atlassian':       'https://status.atlassian.com',
  'linear':          'https://linearstatus.com',
  'notion':          'https://www.notion-status.com',
  'discord':         'https://discordstatus.com',
  'dropbox':         'https://status.dropbox.com',
  // Cloud Platforms
  'gcp-console':     'https://status.cloud.google.com',
  'googleapis':      'https://status.cloud.google.com',
  'azure-portal':    'https://azure.status.microsoft',
  'azure-mgmt':      'https://azure.status.microsoft',
  'aws':             'https://health.aws.amazon.com',
  'digitalocean':    'https://status.digitalocean.com',
  'hetzner':         'https://status.hetzner.com',
  // Data Platforms
  'supabase':        'https://status.supabase.com',
  'planetscale':     'https://planetscalestatus.com',
  'neon':            'https://neonstatus.com',
  'mongodb-atlas':   'https://status.mongodb.com',
  // Developer Tools
  'terraform-registry': 'https://status.hashicorp.com',
  // CDN & Edge
  'cloudflare':      'https://www.cloudflarestatus.com',
  'fastly':          'https://status.fastly.com',
  'bunny-cdn':       'https://status.bunny.net',
  // DNS & Security
  'cloudflare-dns':  'https://www.cloudflarestatus.com',
  'google-dns':      'https://status.cloud.google.com',
  // Auth & Identity
  'okta':            'https://status.okta.com',
  'clerk':           'https://status.clerk.com',
  // Payments
  'stripe-api':      'https://status.stripe.com',
  'paypal':          'https://www.paypal-status.com',
  'braintree':       'https://status.braintreepayments.com',
  // Deployment
  'vercel':          'https://www.vercel-status.com',
  'netlify':         'https://www.netlifystatus.com',
  'fly-io':          'https://status.fly.io',
  'render':          'https://status.render.com',
  'railway':         'https://status.railway.app',
  'heroku':          'https://status.heroku.com',
  // Communications
  'twilio':          'https://status.twilio.com',
  'slack':           'https://status.slack.com',
  // Maps
  'mapbox':          'https://status.mapbox.com',
  // Package Registries
  'npm-registry':    'https://status.npmjs.org',
  'nuget':           'https://status.nuget.org',
  'pypi':            'https://status.python.org',
  'docker-hub':      'https://www.dockerstatus.com',
  // CI/CD
  'github-actions':  'https://www.githubstatus.com',
  'circleci':        'https://status.circleci.com',
  'buildkite':       'https://www.buildkitestatus.com',
  // Observability
  'pagerduty':       'https://status.pagerduty.com',
  'datadog':         'https://status.datadoghq.com',
  'sentry':          'https://status.sentry.io',
  'splunk':          'https://status.splunkcloud.com',
  'elastic':         'https://status.elastic.co',
  // AI Services
  'openai':          'https://status.openai.com',
  'anthropic':       'https://status.anthropic.com',
  'hugging-face':    'https://status.huggingface.co',
  'google-gemini':   'https://status.cloud.google.com',
  'groq':            'https://status.groq.com',
};

export function getStatusPageUrl(serviceId: string): string | null {
  return STATUS_PAGE_HOMEPAGES[serviceId] ?? null;
}

type ApiType = 'statuspage' | 'gcp';

const STATUS_APIS: Partial<Record<string, { url: string; type: ApiType }>> = {
  // Source Control
  'github-web':     { url: 'https://www.githubstatus.com/api/v2/summary.json',     type: 'statuspage' },
  'github-api':     { url: 'https://www.githubstatus.com/api/v2/summary.json',     type: 'statuspage' },
  'gitlab':         { url: 'https://status.gitlab.com/api/v2/summary.json',        type: 'statuspage' },
  'bitbucket':      { url: 'https://status.atlassian.com/api/v2/summary.json',     type: 'statuspage' },
  'atlassian':      { url: 'https://status.atlassian.com/api/v2/summary.json',     type: 'statuspage' },
  'linear':         { url: 'https://linearstatus.com/api/v2/summary.json',       type: 'statuspage' },
  'notion':         { url: 'https://www.notion-status.com/api/v2/summary.json',   type: 'statuspage' },
  'discord':        { url: 'https://discordstatus.com/api/v2/summary.json',      type: 'statuspage' },
  'dropbox':        { url: 'https://status.dropbox.com/api/v2/summary.json',     type: 'statuspage' },
  // Cloud Platforms
  'gcp-console':    { url: 'https://status.cloud.google.com/incidents.json',       type: 'gcp' },
  'googleapis':     { url: 'https://status.cloud.google.com/incidents.json',       type: 'gcp' },
  'digitalocean':   { url: 'https://status.digitalocean.com/api/v2/summary.json',  type: 'statuspage' },
  // Data Platforms
  'supabase':       { url: 'https://status.supabase.com/api/v2/summary.json',      type: 'statuspage' },
  'planetscale':    { url: 'https://planetscalestatus.com/api/v2/summary.json',    type: 'statuspage' },
  'mongodb-atlas':  { url: 'https://status.mongodb.com/api/v2/summary.json',       type: 'statuspage' },
  // Developer Tools
  'terraform-registry': { url: 'https://status.hashicorp.com/api/v2/summary.json', type: 'statuspage' },
  // CDN & Edge
  'cloudflare':     { url: 'https://www.cloudflarestatus.com/api/v2/summary.json', type: 'statuspage' },
  'fastly':         { url: 'https://status.fastly.com/api/v2/summary.json',        type: 'statuspage' },
  'bunny-cdn':      { url: 'https://status.bunny.net/api/v2/summary.json',         type: 'statuspage' },
  // DNS & Security
  'cloudflare-dns': { url: 'https://www.cloudflarestatus.com/api/v2/summary.json', type: 'statuspage' },
  'google-dns':     { url: 'https://status.cloud.google.com/incidents.json',       type: 'gcp' },
  // Auth & Identity
  'clerk':          { url: 'https://status.clerk.com/api/v2/summary.json',         type: 'statuspage' },
  // Deployment
  'vercel':         { url: 'https://www.vercel-status.com/api/v2/summary.json',    type: 'statuspage' },
  'netlify':        { url: 'https://www.netlifystatus.com/api/v2/summary.json',    type: 'statuspage' },
  'fly-io':         { url: 'https://status.fly.io/api/v2/summary.json',            type: 'statuspage' },
  'render':         { url: 'https://status.render.com/api/v2/summary.json',        type: 'statuspage' },
  'railway':        { url: 'https://status.railway.app/api/v2/summary.json',       type: 'statuspage' },
  'heroku':         { url: 'https://status.heroku.com/api/v2/summary.json',        type: 'statuspage' },
  // Communications
  'twilio':         { url: 'https://status.twilio.com/api/v2/summary.json',       type: 'statuspage' },
  'slack':          { url: 'https://status.slack.com/api/v2/summary.json',        type: 'statuspage' },
  // Maps
  'mapbox':         { url: 'https://status.mapbox.com/api/v2/summary.json',       type: 'statuspage' },
  // Package Registries
  'npm-registry':   { url: 'https://status.npmjs.org/api/v2/summary.json',         type: 'statuspage' },
  'pypi':           { url: 'https://status.python.org/api/v2/summary.json',        type: 'statuspage' },
  'docker-hub':     { url: 'https://www.dockerstatus.com/api/v2/summary.json',     type: 'statuspage' },
  'crates-io':      { url: 'https://status.crates.io/api/v2/summary.json',         type: 'statuspage' },
  'rubygems':       { url: 'https://status.rubygems.org/api/v2/summary.json',      type: 'statuspage' },
  // Payments
  'braintree':      { url: 'https://status.braintreepayments.com/api/v2/summary.json', type: 'statuspage' },
  // CI/CD
  'github-actions': { url: 'https://www.githubstatus.com/api/v2/summary.json',     type: 'statuspage' },
  'circleci':       { url: 'https://status.circleci.com/api/v2/summary.json',      type: 'statuspage' },
  'buildkite':      { url: 'https://www.buildkitestatus.com/api/v2/summary.json',  type: 'statuspage' },
  // Observability
  'pagerduty':      { url: 'https://status.pagerduty.com/api/v2/summary.json',     type: 'statuspage' },
  'datadog':        { url: 'https://status.datadoghq.com/api/v2/summary.json',     type: 'statuspage' },
  'sentry':         { url: 'https://status.sentry.io/api/v2/summary.json',         type: 'statuspage' },
  'splunk':         { url: 'https://status.splunkcloud.com/api/v2/summary.json',   type: 'statuspage' },
  'elastic':        { url: 'https://status.elastic.co/api/v2/summary.json',       type: 'statuspage' },
  // AI Services
  'openai':         { url: 'https://status.openai.com/api/v2/summary.json',        type: 'statuspage' },
  'anthropic':      { url: 'https://status.anthropic.com/api/v2/summary.json',     type: 'statuspage' },
  'hugging-face':   { url: 'https://status.huggingface.co/api/v2/summary.json',    type: 'statuspage' },
  'google-gemini':  { url: 'https://status.cloud.google.com/incidents.json',       type: 'gcp' },
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

// ── Severity helpers ──────────────────────────────────────────────────────────

import type { NotifLevel } from './types';

const LEVEL_RANK: Record<NotifLevel, number> = { outage: 4, partial: 3, degraded: 2, maintenance: 1 };

function notifToLevel(n: StatusNotification): NotifLevel | null {
  if (n.type === 'maintenance') return 'maintenance';
  const imp = (n.impact ?? '').toLowerCase();
  if (imp === 'critical') return 'outage';
  if (imp === 'major' || imp === 'high') return 'partial';
  return 'degraded'; // mirrors getSeverity() in detail.tsx: 'minor', 'none', and anything else → degraded
}

/** Returns the most severe active notification level, or null if none. */
export function worstNotifLevel(notifications: StatusNotification[]): NotifLevel | null {
  let worst: NotifLevel | null = null;
  for (const n of notifications) {
    const level = notifToLevel(n);
    if (level && (!worst || LEVEL_RANK[level] > LEVEL_RANK[worst])) worst = level;
  }
  return worst;
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
