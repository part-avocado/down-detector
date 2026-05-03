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
  ('github-web',   'GitHub Web',              'Source Control',    'https://github.com'),
  ('github-api',   'GitHub API',              'Source Control',    'https://api.github.com'),
  ('gitlab',       'GitLab',                  'Source Control',    'https://gitlab.com'),
  ('gcp-console',  'GCP Console',             'Cloud Platforms',   'https://console.cloud.google.com'),
  ('azure-portal', 'Azure Portal',            'Cloud Platforms',   'https://portal.azure.com'),
  ('aws',          'AWS Console',             'Cloud Platforms',   'https://console.aws.amazon.com'),
  ('cloudflare',   'Cloudflare',              'CDN & Edge',        'https://www.cloudflare.com'),
  ('fastly',       'Fastly',                  'CDN & Edge',        'https://www.fastly.com'),
  ('googleapis',   'Google Accounts',         'Auth & Identity',   'https://accounts.google.com/'),
  ('azure-mgmt',   'Azure Active Directory',  'Auth & Identity',   'https://login.microsoftonline.com'),
  ('npm-registry', 'npm Registry',            'Package Registries','https://registry.npmjs.org'),
  ('pypi',         'PyPI',                    'Package Registries','https://pypi.org'),
  ('docker-hub',   'Docker Hub',              'Package Registries','https://hub.docker.com'),
  ('stripe-api',   'Stripe.js CDN',           'Payments',          'https://js.stripe.com/v3/'),
  ('vercel',       'Vercel',                  'Deployment',        'https://vercel.com'),
  ('fly-io',       'Fly.io',                  'Deployment',        'https://fly.io'),
  ('render',       'Render',                  'Deployment',        'https://render.com'),
  ('openai',       'OpenAI',                  'AI Services',       'https://openai.com'),
  ('anthropic',    'Anthropic',               'AI Services',       'https://anthropic.com');

-- Migrate existing services to functional categories + correct names
UPDATE services SET category = 'Source Control'     WHERE id IN ('github-web', 'github-api');
UPDATE services SET category = 'Cloud Platforms'    WHERE id IN ('gcp-console', 'azure-portal');
UPDATE services SET category = 'CDN & Edge'         WHERE id = 'cloudflare';
UPDATE services SET category = 'Auth & Identity',   name = 'Google Accounts',        url = 'https://accounts.google.com/' WHERE id = 'googleapis';
UPDATE services SET category = 'Auth & Identity',   name = 'Azure Active Directory'  WHERE id = 'azure-mgmt';
UPDATE services SET category = 'Package Registries' WHERE id = 'npm-registry';
UPDATE services SET category = 'Payments'           WHERE id = 'stripe-api';
UPDATE services SET category = 'Deployment'         WHERE id = 'vercel';
UPDATE services SET name = 'AWS', url = 'https://aws.amazon.com'    WHERE id = 'aws';
UPDATE services SET url = 'https://www.docker.com'                  WHERE id = 'docker-hub';
