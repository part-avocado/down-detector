import type { ServiceStatus } from '../types';
import { ServiceRow } from './components';
import { CSS } from './styles';

interface PageProps {
  statuses: ServiceStatus[];
  generatedAt: Date;
}

const CATEGORY_ORDER = [
  'Source Control', 'Cloud Platforms', 'CDN & Edge', 'DNS & Security',
  'Auth & Identity', 'CI/CD', 'Package Registries', 'Payments',
  'Deployment', 'Observability', 'AI Services',
];

/** Rotated among these while all monitored endpoints look OK — choice is sticky per tab via sessionStorage so polling does not change it. */
const OK_HEADLINES = [
  'internet is fine, stop panicking',
  'all monitored endpoints answered politely',
  'nothing burning on the dashboards we ping',
  'no red dots in this neighbourhood',
  'the tubes are behaving',
  'go touch grass',
  'calm skies over the URLs we watch',
  'everyone showed up with a 200 and a sandwich',
  "we'll tell you if something goes wrong",
];

export function StatusPage({ statuses, generatedAt }: PageProps) {
  const anyDown = statuses.some(s => s.latest?.status === 'down');
  const anyDegraded = statuses.some(s => s.latest?.status === 'degraded');
  const anyData = statuses.some(s => s.latest !== null);

  const orbClass = !anyData ? 'warn' : anyDown ? 'crit' : anyDegraded ? 'warn' : 'ok';
  const headline = !anyData
    ? 'waiting for checks'
    : anyDown
    ? 'internet is cooked'
    : anyDegraded
    ? 'internet is mildly cooked'
    : OK_HEADLINES[0];
  const sub = !anyData
    ? 'POST /api/trigger to seed initial data'
    : `${statuses.length} services monitored · refreshes every 5 minutes`;

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
                .map(ss => <ServiceRow key={ss.service.id} ss={ss} />)}
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
          var OKMSGS = ${JSON.stringify(OK_HEADLINES)};
          var OKKEY = 'dd-ok-headline-i';
          function applyStickyOkHeadline() {
            var orb = document.querySelector('.orb');
            var titleEl = document.querySelector('.hero-title');
            if (!orb || !titleEl || !orb.classList.contains('ok')) return;
            var i = sessionStorage.getItem(OKKEY);
            if (i === null || i === '') {
              i = String(Math.floor(Math.random() * OKMSGS.length));
              sessionStorage.setItem(OKKEY, i);
            }
            var idx = parseInt(i, 10);
            if (idx >= 0 && idx < OKMSGS.length) titleEl.textContent = OKMSGS[idx];
          }
          applyStickyOkHeadline();
          setInterval(async function() {
            try {
              var q = (document.getElementById('svc-search') || {}).value || '';
              var res = await fetch('/');
              var html = await res.text();
              var doc = new DOMParser().parseFromString(html, 'text/html');
              document.querySelector('.page').replaceWith(doc.querySelector('.page'));
              var ni = document.getElementById('svc-search');
              if (ni && q) { ni.value = q; filterSvcs(q); }
              applyStickyOkHeadline();
            } catch {}
          }, 30000);
        `}} />
      </body>
    </html>
  );
}
