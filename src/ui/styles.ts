export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    background: #090909;
    color: #c8c8c8;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .page { max-width: 680px; margin: 0 auto; padding: 3.5rem 1.5rem 6rem; }

  .site-label {
    font-size: 0.625rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.16em; color: #4a4a4a; margin-bottom: 5rem;
  }

  /* ── Hero ── */
  .hero { text-align: center; margin-bottom: 5rem; }

  @keyframes glow-breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .orb {
    width: 48px; height: 48px; border-radius: 50%;
    margin: 0 auto 1.75rem;
    animation: glow-breathe 4s ease-in-out infinite;
  }
  .orb.ok {
    background: radial-gradient(circle at 38% 32%, #4ade80, #15803d);
    box-shadow: 0 0 0 10px rgba(74,222,128,0.07), 0 0 48px rgba(74,222,128,0.25);
  }
  .orb.warn {
    background: radial-gradient(circle at 38% 32%, #fcd34d, #b45309);
    box-shadow: 0 0 0 10px rgba(252,211,77,0.07), 0 0 48px rgba(252,211,77,0.25);
  }
  .orb.crit {
    background: radial-gradient(circle at 38% 32%, #f87171, #b91c1c);
    box-shadow: 0 0 0 10px rgba(248,113,113,0.07), 0 0 48px rgba(248,113,113,0.25);
  }

  .hero-title {
    font-size: 1.5rem; font-weight: 600; letter-spacing: -0.025em;
    color: #e4e4e4; margin-bottom: 0.5rem; line-height: 1.25;
  }
  .hero-sub { font-size: 0.8125rem; color: #585858; }

  /* ── Service sections ── */
  .section-label {
    font-size: 0.5625rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.18em; color: #444;
    padding: 2.75rem 0 0.875rem;
  }
  .section:first-of-type .section-label { padding-top: 0; }

  .service {
    display: flex; align-items: center; gap: 1rem;
    padding: 0.625rem 0;
    border-bottom: 1px solid #161616;
    text-decoration: none; color: inherit;
    transition: opacity 0.15s;
  }
  .service:hover { opacity: 0.65; }
  .section:last-of-type .service:last-child { border-bottom: none; }

  .sdot {
    width: 6px; height: 6px; border-radius: 50%;
    flex-shrink: 0; margin-top: 1px;
  }
  .sdot.up       { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.5); }
  .sdot.degraded { background: #f59e0b; box-shadow: 0 0 6px rgba(245,158,11,0.5); }
  .sdot.down     { background: #ef4444; box-shadow: 0 0 6px rgba(239,68,68,0.5); }
  .sdot.unsure   { background: #94a3b8; box-shadow: 0 0 6px rgba(148,163,184,0.4); }
  .sdot.unknown  { background: #1e1e1e; }

  .sname { flex: 1; font-size: 0.9375rem; color: #b8b8b8; letter-spacing: -0.01em; }

  .bars { display: flex; gap: 2px; align-items: center; }
  .bar { width: 5px; height: 16px; border-radius: 2px; flex-shrink: 0; }
  .bar.up       { background: #22c55e; }
  .bar.degraded { background: #f59e0b; }
  .bar.down     { background: #ef4444; }
  .bar.unsure   { background: #94a3b8; }
  .bar.unknown  { background: #252525; }

  .smeta {
    font-size: 0.75rem; font-weight: 500; min-width: 3.75rem;
    text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap;
  }
  .smeta.up       { color: #22c55e; }
  .smeta.degraded { color: #f59e0b; }
  .smeta.down     { color: #ef4444; }
  .smeta.unsure   { color: #94a3b8; }
  .smeta.unknown  { color: #484848; }

  .sage { font-size: 0.6875rem; color: #525252; min-width: 4.5rem; text-align: right; white-space: nowrap; }

  /* ── Footer ── */
  .footer { margin-top: 5rem; text-align: center; }
  .footer-line { font-size: 0.6875rem; color: #4a4a4a; line-height: 2.5; }

  /* ── Detail page ── */
  .back {
    display: inline-block; font-size: 0.75rem; color: #545454;
    text-decoration: none; margin-bottom: 3.5rem; letter-spacing: 0.01em;
    transition: color 0.1s;
  }
  .back:hover { color: #909090; }

  .detail-header { margin-bottom: 2.5rem; }
  .detail-top { display: flex; align-items: center; gap: 0.875rem; margin-bottom: 0.375rem; }
  .detail-name {
    font-size: 1.375rem; font-weight: 600; letter-spacing: -0.025em; color: #e0e0e0;
  }
  .detail-url {
    font-size: 0.75rem; color: #525252;
    font-family: 'SF Mono', ui-monospace, 'Cascadia Code', monospace;
    letter-spacing: 0.01em; margin-bottom: 0.3rem;
  }
  .detail-status-link {
    display: inline-block; font-size: 0.75rem; color: #525252;
    font-family: 'SF Mono', ui-monospace, 'Cascadia Code', monospace;
    letter-spacing: 0.01em; text-decoration: underline;
    text-underline-offset: 2px; text-decoration-color: #333;
  }
  .detail-status-link:hover { color: #888; text-decoration-color: #888; }

  .explain {
    background: #0d0d0d; border: 1px solid #1e1e1e; border-radius: 10px;
    padding: 1.25rem 1.375rem; margin-bottom: 3rem;
  }
  .explain-label {
    font-size: 0.5625rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.16em; margin-bottom: 0.625rem;
  }
  .explain-label.up       { color: #22c55e; }
  .explain-label.degraded { color: #f59e0b; }
  .explain-label.down     { color: #ef4444; }
  .explain-label.unsure   { color: #94a3b8; }
  .explain-label.unknown  { color: #2e2e2e; }
  .explain-reason { font-size: 0.875rem; color: #707070; line-height: 1.65; }
  .explain-rules {
    margin-top: 1.125rem; padding-top: 1.125rem; border-top: 1px solid #1a1a1a;
    display: flex; flex-direction: column; gap: 0.3rem;
  }
  .rule { font-size: 0.6875rem; color: #484848; line-height: 1.6; }
  .rule b { color: #606060; font-weight: 500; }
  .rule.rule-hit {
    padding: 0.45rem 0.55rem; margin-left: -0.55rem; margin-right: -0.55rem;
    border-radius: 6px;
    border: 1px solid transparent;
  }
  .rule.rule-hit-up {
    border-color: rgba(34,197,94,0.35);
    background: rgba(34,197,94,0.08);
    color: #8fb89a;
  }
  .rule.rule-hit-up b { color: #4ade80; }
  .rule.rule-hit-degraded {
    border-color: rgba(245,158,11,0.35);
    background: rgba(245,158,11,0.08);
    color: #b89b6e;
  }
  .rule.rule-hit-degraded b { color: #fbbf24; }
  .rule.rule-hit-down {
    border-color: rgba(239,68,68,0.38);
    background: rgba(239,68,68,0.09);
    color: #b88a85;
  }
  .rule.rule-hit-down b { color: #f87171; }
  .rule.rule-hit-unsure {
    border-color: rgba(148,163,184,0.3);
    background: rgba(148,163,184,0.06);
    color: #8e9aaa;
  }
  .rule.rule-hit-unsure b { color: #94a3b8; }

  /* ── Search ── */
  .search-wrap { margin-bottom: 2rem; }
  .search-input {
    width: 100%; background: transparent; border: 1px solid #1c1c1c; border-radius: 6px;
    padding: 0.5625rem 0.875rem; font-family: inherit; font-size: 0.8125rem;
    color: #b0b0b0; outline: none; transition: border-color 0.15s;
  }
  .search-input::placeholder { color: #363636; }
  .search-input:focus { border-color: #2e2e2e; }

  /* ── Notification cards ── */
  .notif-section { margin-bottom: 2.5rem; display: flex; flex-direction: column; gap: 0.5rem; }

  .notif-card {
    border-radius: 8px; padding: 0.875rem 1rem;
    border: 1px solid transparent;
    display: flex; flex-direction: column; gap: 0.35rem;
  }
  .notif-sev-critical    { background: rgba(239,68,68,0.07);    border-color: rgba(239,68,68,0.16); }
  .notif-sev-partial     { background: rgba(249,115,22,0.07);   border-color: rgba(249,115,22,0.16); }
  .notif-sev-degraded    { background: rgba(234,179,8,0.06);    border-color: rgba(234,179,8,0.14); }
  .notif-sev-maintenance { background: rgba(59,130,246,0.06);   border-color: rgba(59,130,246,0.14); }

  .notif-head { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.1rem; }

  .notif-badge {
    font-size: 0.625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
  }
  .notif-badge-critical    { color: #f87171; }
  .notif-badge-partial     { color: #fb923c; }
  .notif-badge-degraded    { color: #fbbf24; }
  .notif-badge-maintenance { color: #60a5fa; }

  .notif-head-status { font-size: 0.6875rem; color: #484848; text-transform: capitalize; }

  .notif-title { font-size: 0.875rem; font-weight: 500; color: #c0c0c0; line-height: 1.4; }
  .notif-body {
    font-size: 0.8125rem; color: #505050; line-height: 1.6;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }

  .notif-foot {
    display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem;
    margin-top: 0.2rem; font-size: 0.6875rem;
  }
  .notif-foot-impact    { color: #3e3e3e; }
  .notif-foot-scheduled { color: #3e3e3e; }
  .notif-foot-link {
    margin-left: auto; color: #424242; text-decoration: none; transition: color 0.1s; cursor: pointer;
  }
  .notif-foot-link:hover { color: #888; }

  .check-list-heading {
    font-size: 0.5625rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.18em; color: #444; margin-bottom: 0.625rem;
  }
  .check-item {
    display: flex; align-items: center; gap: 0.875rem;
    padding: 0.5625rem 0; border-bottom: 1px solid #0d0d0d;
    font-size: 0.8125rem;
  }
  .check-item:last-child { border-bottom: none; }
  .check-code { font-weight: 500; min-width: 2.25rem; font-variant-numeric: tabular-nums; }
  .check-code.up       { color: #22c55e; }
  .check-code.degraded { color: #f59e0b; }
  .check-code.down     { color: #ef4444; }
  .check-code.unsure   { color: #94a3b8; }
  .check-code.unknown  { color: #2a2a2a; }
  .check-latency {
    min-width: 3.5rem; color: #555;
    font-variant-numeric: tabular-nums; text-align: right;
  }
  .check-error { flex: 1; color: #555; font-size: 0.6875rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .check-time { margin-left: auto; color: #505050; font-size: 0.6875rem; white-space: nowrap; }

  @media (max-width: 560px) {
    .page { padding: 2.5rem 1.25rem 4rem; }
    .sage { display: none; }
    .bar { width: 4px; height: 12px; }
    .check-latency { display: none; }
  }
`;
