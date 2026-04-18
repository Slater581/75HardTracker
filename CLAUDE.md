# 75 Hard Tracker — Claude Context

## What this app is
A personal habit tracker for the 75 Hard challenge. Two users: **Hannah** and **Michael** (a couple). Each user has their own goals and data stored separately. The app is used daily on iPhone.

## Deployment
- **Live URL:** https://75hard-tracker-beige.vercel.app
- **GitHub:** https://github.com/Slater581/75HardTracker
- **Hosting:** Vercel — auto-deploys when code is pushed to the `main` branch on GitHub
- **Workflow:** Edit files locally → test on local dev server → `git add . && git commit -m "message" && git push` → Vercel auto-deploys

## Local development
- Start dev server: `npm run dev -- --host` from `C:\Users\Mike_\75hard-tracker`
- Local URL: `http://localhost:5173/` (port pinned in vite.config.js)
- Network URL for iPhone on same Wi-Fi: `http://10.0.0.28:5173/`

## Tech stack
- React 19 + Vite
- No backend — all data stored in browser localStorage
- No UI library — custom CSS in `src/App.css` and `src/index.css`

## Project structure
```
src/
  config.js          — User definitions (goals, colors) and date utility functions
  useStorage.js      — Custom useLocalStorage hook
  App.jsx            — Root component; owns shared data state, handles user switching and tab navigation
  App.css            — All component styles
  components/
    TodayView.jsx    — Daily goal checklist; user checks off goals here
    ProgressView.jsx — 75-day dot grid, streak counter, perfect days count, bar chart
```

## Data structure
Data is stored in localStorage under the key `75hard_{userId}_data` (e.g. `75hard_michael_data`).

```js
{
  startDate: "2026-04-15",  // YYYY-MM-DD string, null if not started
  days: {
    "2026-04-15": {
      walk: true,
      water: false,
      burn: 1,    // weekly goals store a count (number)
      ...
    }
  }
}
```

State is owned by `App.jsx` and passed down as props to both views so they share the same React state.

## Goal types
- `daily` — must be done every day; stored as boolean (true/false)
- `3x` — must be done 3 times per week; stored as a number (count per day)
- `1x` — must be done once per week; stored as boolean

## Key business logic decisions

### Perfect day (ProgressView `isDayComplete`)
A day is "perfect" if **all daily goals** are checked. Weekly goals (3x, 1x) are irrelevant to perfect day status.

### Streak (ProgressView streak calculation)
- Only counts **fully passed days** — today is never included in the streak
- Uses relaxed logic: ≥5 daily goals done counts as a streak day
- Weekly goals only penalize the streak after the week is fully over (Sunday night)
- Week runs Sunday–Saturday

### Dot grid statuses
- **Perfect** (gold) — all daily goals complete
- **Streak** (dark color) — ≥5 daily goals done, weekly goals on track
- **Partial** (light color) — some goals done but not enough for streak
- **Missed** (gray) — no data recorded for that day
- **Upcoming** (light gray) — future day

## Users
Both users are defined in `src/config.js` and cannot be changed in the app UI — edit config.js to add/change goals.

**Hannah** — pink theme
- 7 daily goals: walking, water, protein, fruit/veg, reading, art, no social media
- 1 weekly 3x goal: burn workout
- 1 weekly 1x goal: spiritual study

**Michael** — blue theme
- 7 daily goals: steps, protein, fruit/veg, kanji, grip strength, no social media, meditation
- 1 weekly 3x goal: burn workout
- 1 weekly 1x goal: 1 hour in Claude Code

## Important notes for Claude
- The user (Michael) is not a programmer — explain things in plain terms
- Always push changes to GitHub after making them so Vercel deploys
- Test locally first using the dev server before pushing
- Do not add unnecessary complexity — keep the app simple and focused
