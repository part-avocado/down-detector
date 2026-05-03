CREATE TABLE IF NOT EXISTS services (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  category   TEXT NOT NULL,
  url        TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS checks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id  TEXT NOT NULL REFERENCES services(id),
  checked_at  INTEGER NOT NULL,
  status      TEXT NOT NULL,
  latency_ms  INTEGER,
  status_code INTEGER,
  error       TEXT
);

CREATE INDEX IF NOT EXISTS idx_checks_service_checked
  ON checks (service_id, checked_at DESC);

INSERT OR IGNORE INTO services (id, name, category, url) VALUES
  ('github-web',   'GitHub Web',              'Source Control',    'https://github.com/manifest.json'),
  ('github-api',   'GitHub API',              'Source Control',    'https://api.github.com/meta'),
  ('gitlab',       'GitLab',                  'Source Control',    'https://gitlab.com/-/manifest.json'),
  ('gcp-console',  'GCP Console',             'Cloud Platforms',   'https://status.cloud.google.com/incidents.json'),
  ('azure-portal', 'Azure Portal',            'Cloud Platforms',   'https://azure.status.microsoft/status'),
  ('aws',          'AWS Console',             'Cloud Platforms',   'https://ecs.amazonaws.com'),
  ('cloudflare',   'Cloudflare',              'CDN & Edge',        'https://api.cloudflare.com'),
  ('fastly',       'Fastly',                  'CDN & Edge',        'https://api.fastly.com/public-ip-list'),
  ('googleapis',   'Google Accounts',         'Auth & Identity',   'https://accounts.google.com/.well-known/openid-configuration'),
  ('azure-mgmt',   'Azure Active Directory',  'Auth & Identity',   'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration'),
  ('npm-registry', 'npm Registry',            'Package Registries','https://registry.npmjs.org/npm'),
  ('pypi',         'PyPI',                    'Package Registries','https://pypi.org/pypi/pip/json'),
  ('docker-hub',   'Docker Hub',              'Package Registries','https://hub.docker.com/v2/repositories/library/hello-world'),
  ('stripe-api',   'Stripe.js CDN',           'Payments',          'https://checkout.stripe.com'),
  ('vercel',       'Vercel',                  'Deployment',        'https://api.vercel.com'),
  ('fly-io',       'Fly.io',                  'Deployment',        'https://fly-metrics.net'),
  ('render',       'Render',                  'Deployment',        'https://dashboard.render.com/login'),
  ('openai',       'OpenAI',                  'AI Services',       'https://platform.openai.com'),
  ('anthropic',    'Anthropic',               'AI Services',       'https://console.anthropic.com');

-- Migrate existing services to functional categories + correct names
UPDATE services SET category = 'Source Control'     WHERE id IN ('github-web', 'github-api');
UPDATE services SET category = 'Cloud Platforms'    WHERE id IN ('gcp-console', 'azure-portal');
UPDATE services SET category = 'CDN & Edge'         WHERE id = 'cloudflare';
UPDATE services SET category = 'Auth & Identity',   name = 'Google Accounts',        url = 'https://accounts.google.com/.well-known/openid-configuration' WHERE id = 'googleapis';
UPDATE services SET category = 'Auth & Identity',   name = 'Azure Active Directory'  WHERE id = 'azure-mgmt';
UPDATE services SET category = 'Package Registries' WHERE id = 'npm-registry';
UPDATE services SET category = 'Payments'           WHERE id = 'stripe-api';
UPDATE services SET category = 'Deployment'         WHERE id = 'vercel';
UPDATE services SET name = 'AWS', url = 'https://ecs.amazonaws.com' WHERE id = 'aws';
UPDATE services SET url = 'https://hub.docker.com/v2/repositories/library/hello-world' WHERE id = 'docker-hub';
UPDATE services SET name = 'Stripe', url = 'https://checkout.stripe.com' WHERE id = 'stripe-api';

-- New services
INSERT OR IGNORE INTO services (id, name, category, url) VALUES
  -- AI Services
  ('hugging-face',    'Hugging Face',         'AI Services',       'https://huggingface.co/api/health'),
  ('google-gemini',   'Google Gemini',        'AI Services',       'https://developers.generativeai.google/api'),
  ('groq',            'Groq',                 'AI Services',       'https://console.groq.com/login'),
  -- Cloud Platforms
  ('digitalocean',    'DigitalOcean',         'Cloud Platforms',   'https://api.digitalocean.com'),
  ('hetzner',         'Hetzner',              'Cloud Platforms',   'https://console.hetzner.cloud'),
  -- CI/CD
  ('github-actions',  'GitHub Actions',       'CI/CD',             'https://api.github.com/repos/actions/runner'),
  ('circleci',        'CircleCI',             'CI/CD',             'https://circleci.com/docs/api/v2'),
  ('buildkite',       'Buildkite',            'CI/CD',             'https://buildkite.com/docs/apis/rest-api'),
  -- Deployment
  ('netlify',         'Netlify',              'Deployment',        'https://app.netlify.com'),
  ('railway',         'Railway',              'Deployment',        'https://nixpacks.railway.app/health'),
  ('heroku',          'Heroku',               'Deployment',        'https://status.heroku.com/api/v4/current-status'),
  -- Payments
  ('paypal',          'PayPal',               'Payments',          'https://www.paypal.com/sdk/js?client-id=sb'),
  ('braintree',       'Braintree',            'Payments',          'https://payments.braintree-api.com/graphql'),
  -- Observability
  ('pagerduty',       'PagerDuty',            'Observability',     'https://developer.pagerduty.com/api-docs/'),
  ('datadog',         'Datadog',              'Observability',     'https://docs.datadoghq.com/api/latest/'),
  ('sentry',          'Sentry',               'Observability',     'https://sentry.io/api/0/'),
  ('slack',           'Slack',                'Observability',     'https://slack.com/api/api.test'),
  -- DNS & Security
  ('cloudflare-dns',  'Cloudflare 1.1.1.1',  'DNS & Security',    'https://cloudflare-dns.com'),
  ('google-dns',      'Google 8.8.8.8',       'DNS & Security',    'https://dns.google/resolve?name=google.com&type=A');

-- Normalize ping targets to API/control-plane endpoints (fixes older rows from INSERT OR IGNORE).
UPDATE services SET url = 'https://github.com/manifest.json' WHERE id = 'github-web';
UPDATE services SET url = 'https://api.github.com/meta' WHERE id = 'github-api';
UPDATE services SET url = 'https://gitlab.com/-/manifest.json' WHERE id = 'gitlab';
UPDATE services SET url = 'https://status.cloud.google.com/incidents.json' WHERE id = 'gcp-console';
UPDATE services SET url = 'https://azure.status.microsoft/status' WHERE id = 'azure-portal';
UPDATE services SET url = 'https://ecs.amazonaws.com' WHERE id = 'aws';
UPDATE services SET url = 'https://api.cloudflare.com' WHERE id = 'cloudflare';
UPDATE services SET url = 'https://api.fastly.com/public-ip-list' WHERE id = 'fastly';
UPDATE services SET url = 'https://accounts.google.com/.well-known/openid-configuration' WHERE id = 'googleapis';
UPDATE services SET url = 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration' WHERE id = 'azure-mgmt';
UPDATE services SET url = 'https://registry.npmjs.org/npm' WHERE id = 'npm-registry';
UPDATE services SET url = 'https://pypi.org/pypi/pip/json' WHERE id = 'pypi';
UPDATE services SET url = 'https://hub.docker.com/v2/repositories/library/hello-world' WHERE id = 'docker-hub';
UPDATE services SET url = 'https://checkout.stripe.com' WHERE id = 'stripe-api';
UPDATE services SET url = 'https://api.vercel.com' WHERE id = 'vercel';
UPDATE services SET url = 'https://fly-metrics.net' WHERE id = 'fly-io';
UPDATE services SET url = 'https://dashboard.render.com/login' WHERE id = 'render';
UPDATE services SET url = 'https://platform.openai.com' WHERE id = 'openai';
UPDATE services SET url = 'https://console.anthropic.com' WHERE id = 'anthropic';
UPDATE services SET url = 'https://huggingface.co/api/health' WHERE id = 'hugging-face';
UPDATE services SET url = 'https://developers.generativeai.google/api' WHERE id = 'google-gemini';
UPDATE services SET url = 'https://console.groq.com/login' WHERE id = 'groq';
UPDATE services SET url = 'https://api.digitalocean.com' WHERE id = 'digitalocean';
UPDATE services SET url = 'https://console.hetzner.cloud' WHERE id = 'hetzner';
UPDATE services SET url = 'https://api.github.com/repos/actions/runner' WHERE id = 'github-actions';
UPDATE services SET url = 'https://circleci.com/docs/api/v2' WHERE id = 'circleci';
UPDATE services SET url = 'https://buildkite.com/docs/apis/rest-api' WHERE id = 'buildkite';
UPDATE services SET url = 'https://app.netlify.com' WHERE id = 'netlify';
UPDATE services SET url = 'https://nixpacks.railway.app/health' WHERE id = 'railway';
UPDATE services SET url = 'https://status.heroku.com/api/v4/current-status' WHERE id = 'heroku';
UPDATE services SET url = 'https://www.paypal.com/sdk/js?client-id=sb' WHERE id = 'paypal';
UPDATE services SET url = 'https://payments.braintree-api.com/graphql' WHERE id = 'braintree';
UPDATE services SET url = 'https://developer.pagerduty.com/api-docs/' WHERE id = 'pagerduty';
UPDATE services SET url = 'https://docs.datadoghq.com/api/latest/' WHERE id = 'datadog';
UPDATE services SET url = 'https://sentry.io/api/0/' WHERE id = 'sentry';
UPDATE services SET url = 'https://slack.com/api/api.test' WHERE id = 'slack';
UPDATE services SET url = 'https://cloudflare-dns.com' WHERE id = 'cloudflare-dns';
UPDATE services SET url = 'https://dns.google/resolve?name=google.com&type=A' WHERE id = 'google-dns';
