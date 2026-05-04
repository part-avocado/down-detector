import type { HeroLevel } from '../impact-tiers';
import { summarizeWorstImpact } from '../impact-tiers';
import type { NotifLevel, ServiceStatus } from '../types';
import { ServiceRow } from './components';
import { CSS } from './styles';

interface PageProps {
  statuses: ServiceStatus[];
  notifLevels: Record<string, NotifLevel>;
  generatedAt: Date;
}

const CATEGORY_ORDER = [
  'Source Control', 'Cloud Platforms', 'Data Platforms', 'Developer Tools',
  'CDN & Edge', 'DNS & Security',
  'Auth & Identity', 'Collaboration', 'Communications', 'Maps',
  'CI/CD', 'Package Registries', 'Payments',
  'Deployment', 'Observability', 'AI Services',
];

/** One of these is chosen at random whenever the homepage is rendered with all-clear state (each poll gets a fresh line). */
const OK_HEADLINES = [
  'internet is fine, stop panicking',
  'all monitored endpoints answered politely',
  'the tubes are behaving',
  'go touch grass',
  'calm skies over the URLs we watch',
  'everyone showed up with a 200 and a sandwich',
  "we'll tell you if something goes wrong",
];

const BACKBONE_DOWN_HEADLINES = [
  'internet is cooked',
  'the big pipes are not having a good day',
  'core internet infra is having a moment',
  'hyperscalers left the chat',
  'yes, it is not just you',
];

const BACKBONE_STRAIN_HEADLINES = [
  'core services are sweaty',
  'hyperscalers are grumpy but still here',
  'the backbone is limping, not collapsed',
  'major platforms are straining',
];

const CRITICAL_TROUBLE_HEADLINES = [
  'internet is mildly cooked',
  'important rails are wobbly',
  'payments and deploy-adjacent stuff is rough',
  'some load-bearing URLs are failing',
];

const CRITICAL_STRAIN_HEADLINES = [
  'key services are fussy',
  'important bits are degraded, not dead',
  'identity and shipping surfaces are uneven',
];

const EDGES_DOWN_HEADLINES = [
  'internet is uneven',
  'mostly fine, patchy corners',
  'niche outage energy',
  'the long tail is having a day',
];

const EDGES_SOFT_HEADLINES = [
  'a few edges are sluggish',
  'nothing huge, just some rough spots',
  'minor weirdness on secondary services',
];

function pickLine(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}

function headlineForLevel(level: HeroLevel): string {
  switch (level) {
    case 'waiting':
      return 'waiting for checks';
    case 'ok':
      return pickLine(OK_HEADLINES);
    case 'backbone_down':
      return pickLine(BACKBONE_DOWN_HEADLINES);
    case 'backbone_strain':
      return pickLine(BACKBONE_STRAIN_HEADLINES);
    case 'critical_trouble':
      return pickLine(CRITICAL_TROUBLE_HEADLINES);
    case 'critical_strain':
      return pickLine(CRITICAL_STRAIN_HEADLINES);
    case 'edges_down':
      return pickLine(EDGES_DOWN_HEADLINES);
    case 'edges_soft':
      return pickLine(EDGES_SOFT_HEADLINES);
  }
}

export function StatusPage({ statuses, notifLevels, generatedAt }: PageProps) {
  const { level, orbClass: impactOrb, anyData } = summarizeWorstImpact(statuses);
  const orbClass = !anyData ? 'warn' : impactOrb;
  const headline = headlineForLevel(level);
  const sub = !anyData
    ? 'POST /api/trigger to seed initial data'
    : `${statuses.length} services monitored · refreshes every 10 minutes`;

  const allCats = [...new Set(statuses.map(s => s.service.category))];
  const categories = allCats.sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b);
  });

  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>status</title>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </head>
      <body>
        <div class="page">
          <div class="site-label">Status</div>
          <div class="hero">
            <div class={`orb ${orbClass}`} />
            <div class="hero-title">{headline}</div>
            <div class="hero-sub">{sub}</div>
          </div>
          <div class="search-wrap">
            <input
              type="search"
              id="svc-search"
              class="search-input"
              placeholder="Search services…"
              autocomplete="off"
            />
          </div>
          {categories.map(cat => (
            <div class="section" key={cat}>
              <div class="section-label">{cat}</div>
              {statuses
                .filter(s => s.service.category === cat)
                .map(ss => <ServiceRow key={ss.service.id} ss={ss} notifLevel={notifLevels[ss.service.id]} />)}
            </div>
          ))}
          <div class="footer">
            <div class="footer-line" id="updated-at">
              Updated {generatedAt.toUTCString()}
            </div>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          function filterSvcs(q) {
            var s = q.toLowerCase().trim();
            document.querySelectorAll('.section').forEach(function(sec) {
              var any = false;
              sec.querySelectorAll('.service').forEach(function(row) {
                var name = (row.querySelector('.sname') || {}).textContent || '';
                var show = !s || name.toLowerCase().indexOf(s) !== -1;
                row.style.display = show ? '' : 'none';
                if (show) any = true;
              });
              sec.style.display = any ? '' : 'none';
            });
          }
          var inp = document.getElementById('svc-search');
          if (inp) inp.addEventListener('input', function() { filterSvcs(this.value); });
          setInterval(async function() {
            try {
              var q = (document.getElementById('svc-search') || {}).value || '';
              var res = await fetch('/');
              var html = await res.text();
              var doc = new DOMParser().parseFromString(html, 'text/html');
              document.querySelector('.page').replaceWith(doc.querySelector('.page'));
              var ni = document.getElementById('svc-search');
              if (ni && q) { ni.value = q; filterSvcs(q); }
            } catch {}
          }, 30000);
        `}} />
      </body>
    </html>
  );
}
