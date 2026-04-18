// Seed / migrate historical data.
// Bump SEED_KEY whenever a migration needs to re-run on existing devices.
const SEED_KEY = '75hard_seeded_v4';
const DAY1 = '2026-04-12'; // Sunday — start date for both users
const DAY2 = '2026-04-13'; // Monday — second burn session so weekly total = 2 before today

// Why burn:1 and not burn:3?
// Setting burn:3 on one day fills the entire week's quota from that single day.
// When the user then taps burn on any other day in the same week, the toggle sees
// remaining===0 and current===0, hits the early-return, and does nothing — causing
// the flash-with-no-change bug, especially visible in iOS standalone (fresh localStorage).
// Distributing burn:1 across real days keeps the toggle logic correct.

function fixBurn(existing) {
  return Math.min(existing || 1, 1); // cap at 1 per day — no single-day quota stuffing
}

export function seedInitialData() {
  if (localStorage.getItem(SEED_KEY)) return;

  // ── Hannah ────────────────────────────────────────────────────────────────
  const hannah = JSON.parse(localStorage.getItem('75hard_hannah_data') || 'null')
    || { startDate: null, days: {} };

  hannah.startDate = DAY1;
  Object.keys(hannah.days).forEach((dk) => { if (dk < DAY1) delete hannah.days[dk]; });

  // Day 1: all daily goals + 1 burn session + spiritual (1×/week).
  hannah.days[DAY1] = Object.assign(
    { walk: true, water: true, protein: true, fruitveg: true,
      reading: true, art: true, nosocial: true, spiritual: true },
    hannah.days[DAY1] || {},
    { burn: fixBurn(hannah.days[DAY1]?.burn) }, // force-correct — was burn:3 in v3
  );

  // Day 2: second burn session → weekly total = 2 heading into today.
  hannah.days[DAY2] = Object.assign(
    {},
    hannah.days[DAY2] || {},
    { burn: fixBurn(hannah.days[DAY2]?.burn) },
  );

  localStorage.setItem('75hard_hannah_data', JSON.stringify(hannah));

  // ── Michael ───────────────────────────────────────────────────────────────
  const michael = JSON.parse(localStorage.getItem('75hard_michael_data') || 'null')
    || { startDate: null, days: {} };

  michael.startDate = DAY1;
  Object.keys(michael.days).forEach((dk) => { if (dk < DAY1) delete michael.days[dk]; });

  michael.days[DAY1] = Object.assign(
    { steps: true, protein: true, fruitveg: true, kanji: true,
      grip: true, nosocial: true, meditation: true, claudecode: true },
    michael.days[DAY1] || {},
    { burn: fixBurn(michael.days[DAY1]?.burn) },
  );

  michael.days[DAY2] = Object.assign(
    {},
    michael.days[DAY2] || {},
    { burn: fixBurn(michael.days[DAY2]?.burn) },
  );

  localStorage.setItem('75hard_michael_data', JSON.stringify(michael));

  localStorage.setItem(SEED_KEY, 'true');
}
