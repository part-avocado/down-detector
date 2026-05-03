import type { CheckStatus, ServiceStatus } from './types';

export type ImpactTier = 'backbone' | 'critical' | 'standard';

/** Per-service-issue weight; max across all unhealthy rows drives the headline. */
const WEIGHT = {
  backbone_down: 5,
  backbone_degraded: 4,
  critical_down: 3,
  critical_degraded: 2,
  standard_down: 1.5,
  standard_degraded: 1,
} as const;

const BACKBONE_IDS = new Set<string>([
  'github-web',
  'github-api',
  'github-actions',
  'gcp-console',
  'aws',
  'azure-portal',
  'cloudflare',
  'googleapis',
  'azure-mgmt',
  'npm-registry',
  'cloudflare-dns',
  'google-dns',
  'slack',
]);

const CRITICAL_IDS = new Set<string>([
  'stripe-api',
  'okta',
  'vercel',
  'gitlab',
  'pypi',
  'docker-hub',
]);

export function impactTier(serviceId: string): ImpactTier {
  if (BACKBONE_IDS.has(serviceId)) return 'backbone';
  if (CRITICAL_IDS.has(serviceId)) return 'critical';
  return 'standard';
}

export type HeroLevel =
  | 'waiting'
  | 'ok'
  | 'backbone_down'
  | 'backbone_strain'
  | 'critical_trouble'
  | 'critical_strain'
  | 'edges_down'
  | 'edges_soft';

export type OrbClass = 'ok' | 'warn' | 'crit';

export interface WorstImpact {
  level: HeroLevel;
  orbClass: OrbClass;
  anyData: boolean;
}

function issueWeightFor(tier: ImpactTier, status: CheckStatus): number {
  const down = status === 'down';
  if (tier === 'backbone') return down ? WEIGHT.backbone_down : WEIGHT.backbone_degraded;
  if (tier === 'critical') return down ? WEIGHT.critical_down : WEIGHT.critical_degraded;
  return down ? WEIGHT.standard_down : WEIGHT.standard_degraded;
}

/**
 * Highest headline severity wins (backbone degraded outranks critical down, etc.).
 * Orb uses Option B: crit only when backbone or critical tier has a down.
 */
export function summarizeWorstImpact(statuses: ServiceStatus[]): WorstImpact {
  const anyData = statuses.some(s => s.latest !== null);

  if (!anyData) {
    return { level: 'waiting', orbClass: 'warn', anyData: false };
  }

  let maxW = 0;
  let anyDownBackboneCritical = false;
  let anyDegraded = false;
  let anyDown = false;

  for (const s of statuses) {
    const st = s.latest?.status;
    if (st !== 'down' && st !== 'degraded') continue;

    const tier = impactTier(s.service.id);
    anyDegraded ||= st === 'degraded';
    anyDown ||= st === 'down';
    if (st === 'down' && tier !== 'standard') anyDownBackboneCritical = true;

    const w = issueWeightFor(tier, st);
    if (w > maxW) maxW = w;
  }

  if (maxW === 0) {
    return { level: 'ok', orbClass: 'ok', anyData: true };
  }

  const orbClass: OrbClass = anyDownBackboneCritical ? 'crit' : anyDegraded || anyDown ? 'warn' : 'ok';

  let level: HeroLevel;
  if (maxW >= WEIGHT.backbone_down) level = 'backbone_down';
  else if (maxW >= WEIGHT.backbone_degraded) level = 'backbone_strain';
  else if (maxW >= WEIGHT.critical_down) level = 'critical_trouble';
  else if (maxW >= WEIGHT.critical_degraded) level = 'critical_strain';
  else if (maxW >= WEIGHT.standard_down) level = 'edges_down';
  else level = 'edges_soft';

  return { level, orbClass, anyData: true };
}
