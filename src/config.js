export const USERS = {
  hannah: {
    id: 'hannah',
    name: 'Hannah',
    primary: '#e8a598',
    dark: '#c4705f',
    light: '#fdf0ed',
    goals: [
      { id: 'walk', label: '30 min walking or running', type: 'daily', emoji: '🏃‍♀️' },
      { id: 'water', label: '64 oz water', type: 'daily', emoji: '💧' },
      { id: 'protein', label: 'Protein at every meal', type: 'daily', emoji: '🥩' },
      { id: 'fruitveg', label: 'Fruit or veggie at every meal', type: 'daily', emoji: '🥦' },
      { id: 'reading', label: '10 pages of reading', type: 'daily', emoji: '📖' },
      { id: 'art', label: 'Drawing / painting / coloring', type: 'daily', emoji: '🎨' },
      { id: 'nosocial', label: 'No social media', type: 'daily', emoji: '📵' },
      { id: 'burn', label: 'Burn workout', type: '3x', emoji: '🔥' },
      { id: 'spiritual', label: 'Spiritual study', type: '1x', emoji: '🙏' },
    ],
  },
  michael: {
    id: 'michael',
    name: 'Michael',
    primary: '#7aaecc',
    dark: '#3d7fa6',
    light: '#edf4f9',
    goals: [
      { id: 'steps', label: '7,000 steps', type: 'daily', emoji: '👟' },
      { id: 'protein', label: 'Protein at every meal', type: 'daily', emoji: '🥩' },
      { id: 'fruitveg', label: 'Fruit or veggie at every meal', type: 'daily', emoji: '🥦' },
      { id: 'kanji', label: '50 kanji practice', type: 'daily', emoji: '漢' },
      { id: 'grip', label: 'Grip strength training — 3 sets', type: 'daily', emoji: '💪' },
      { id: 'nosocial', label: 'No social media', type: 'daily', emoji: '📵' },
      { id: 'meditation', label: 'Meditation', type: 'daily', emoji: '🧘' },
      { id: 'burn', label: 'Burn workout', type: '3x', emoji: '🔥' },
      { id: 'claudecode', label: '1 hour in Claude Code', type: '1x', emoji: '💻' },
    ],
  },
};

export function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getWeekStart(dateKey) {
  // Week runs Sunday–Saturday; resets Saturday night at midnight Utah time.
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay(); // 0=Sun … 6=Sat
  const sunday = new Date(y, m - 1, d - day); // roll back to Sunday
  return `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;
}

export function addDays(dateKey, n) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d + n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function daysBetween(startKey, endKey) {
  const [y1, m1, d1] = startKey.split('-').map(Number);
  const [y2, m2, d2] = endKey.split('-').map(Number);
  const a = new Date(y1, m1 - 1, d1);
  const b = new Date(y2, m2 - 1, d2);
  return Math.round((b - a) / 86400000);
}

export function formatDate(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
