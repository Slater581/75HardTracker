import { useState } from 'react';
import { getTodayKey, addDays, daysBetween, getWeekStart, formatDate } from '../config';

// Full completion for the dot grid (all daily goals met)
function isDayComplete(user, dayData) {
  if (!dayData) return false;

  return user.goals
    .filter((g) => g.type === 'daily')
    .every((g) => !!dayData[g.id]);
}

// Relaxed check for streak: ≥5 daily goals done, and weekly goals met for any completed past week
function isDayGoodForStreak(user, dayData, allDays, dateKey, today) {
  if (!dayData) return false;

  const dailyGoals = user.goals.filter((g) => g.type === 'daily');
  const dailyDone = dailyGoals.filter((g) => !!dayData[g.id]).length;
  if (dailyDone < 5) return false;

  // For weekly goals, only penalize if the week is fully over
  const weekStart = getWeekStart(dateKey);
  const todayWeekStart = getWeekStart(today);
  if (weekStart >= todayWeekStart) return true; // current or future week — no penalty yet

  // Past week: check if weekly targets were met
  const weeklyGoals = user.goals.filter((g) => g.type !== 'daily');
  for (const goal of weeklyGoals) {
    let weekCount = 0;
    for (let i = 0; i < 7; i++) {
      const dk = addDays(weekStart, i);
      const v = allDays[dk]?.[goal.id];
      weekCount += v ? (typeof v === 'number' ? v : 1) : 0;
    }
    if (goal.type === '3x' && weekCount < 3) return false;
    if (goal.type === '1x' && weekCount < 1) return false;
  }

  return true;
}

function getDayStatus(user, allDays, dateKey, startDate, today) {
  const diff = daysBetween(startDate, dateKey);
  if (diff < 0) return 'before';
  if (diff >= 75) return 'beyond';
  if (dateKey > today) return 'future';
  const dayData = allDays[dateKey];
  if (!dayData || Object.keys(dayData).length === 0) return 'missed';
  if (isDayComplete(user, dayData)) return 'perfect';
  if (isDayGoodForStreak(user, dayData, allDays, dateKey, today)) return 'streak';
  return 'partial';
}

function StreakModal({ user, onClose }) {
  const weeklyGoals = user.goals.filter((g) => g.type !== 'daily');
  const dailyGoals = user.goals.filter((g) => g.type === 'daily');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ background: user.primary }}>
          <span className="modal-title">How Your Streak Works</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-section">
            <div className="modal-icon">📅</div>
            <div>
              <strong>Daily goals</strong>
              <p>Complete at least 5 of your {dailyGoals.length} daily goals to keep the streak alive for that day.</p>
            </div>
          </div>
          {weeklyGoals.length > 0 && (
            <div className="modal-section">
              <div className="modal-icon">📆</div>
              <div>
                <strong>Weekly goals</strong>
                <p>These are checked by the week (Monday–Sunday), not by the day:</p>
                <ul className="modal-list">
                  {weeklyGoals.map((g) => (
                    <li key={g.id}>
                      {g.emoji} {g.label} — must be done{' '}
                      {g.type === '3x' ? 'at least 3 times' : 'at least once'} each week
                    </li>
                  ))}
                </ul>
                <p>Weekly goals won't hurt your streak until the week is over. You have until Sunday night to hit your weekly targets.</p>
              </div>
            </div>
          )}
          <div className="modal-section">
            <div className="modal-icon">🕛</div>
            <div>
              <strong>Week reset</strong>
              <p>Each week runs Sunday through Saturday. The window resets every Saturday night at midnight Utah time — so you have until then to hit your weekly targets.</p>
            </div>
          </div>
          <div className="modal-section">
            <div className="modal-icon">💡</div>
            <div>
              <strong>Tip</strong>
              <p>Perfect days (all goals completed) still show separately — keep stacking them!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProgressView({ user, data }) {
  const [showStreakInfo, setShowStreakInfo] = useState(false);

  const today = getTodayKey();

  if (!data.startDate) {
    return (
      <div className="progress-empty">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
        <p>Start your 75 Hard journey to see progress here!</p>
      </div>
    );
  }

  const { startDate, days } = data;
  const currentDay = Math.min(75, Math.max(1, daysBetween(startDate, today) + 1));

  // Build 75-day grid
  const dots = [];
  for (let i = 0; i < 75; i++) {
    const dk = addDays(startDate, i);
    const status = getDayStatus(user, days, dk, startDate, today);
    dots.push({ day: i + 1, dateKey: dk, status });
  }

  // Streak — relaxed logic: ≥5 daily + weekly goals met per completed week
  // Only count days that have fully passed (not today)
  let streak = 0;
  let d = addDays(today, -1);
  while (daysBetween(startDate, d) >= 0) {
    const dayData = days[d];
    if (isDayGoodForStreak(user, dayData, days, d, today)) {
      streak++;
      d = addDays(d, -1);
    } else {
      break;
    }
  }

  // Perfect days (strict: all goals complete)
  const perfectDays = dots.filter((dot) => dot.status === 'perfect').length;

  // Recent 7 days bar chart data
  const recentDays = [];
  for (let i = 6; i >= 0; i--) {
    const dk = addDays(today, -i);
    if (daysBetween(startDate, dk) < 0) {
      recentDays.push({ dateKey: dk, count: 0, total: user.goals.length, label: formatDate(dk) });
      continue;
    }
    const dayData = days[dk] || {};
    const dailyGoals = user.goals.filter((g) => g.type === 'daily');
    const weekStart = getWeekStart(dk);
    let count = 0;
    dailyGoals.forEach((g) => { if (dayData[g.id]) count++; });
    user.goals.filter((g) => g.type !== 'daily').forEach((g) => {
      let weekCount = 0;
      for (let j = 0; j < 7; j++) {
        const wdk = addDays(weekStart, j);
        const v = days[wdk]?.[g.id];
        weekCount += v ? (typeof v === 'number' ? v : 1) : 0;
      }
      if ((g.type === '3x' && weekCount >= 3) || (g.type === '1x' && weekCount >= 1)) count++;
    });
    recentDays.push({ dateKey: dk, count, total: user.goals.length, label: formatDate(dk) });
  }

  const maxCount = user.goals.length;

  return (
    <div className="progress-view">
      {showStreakInfo && (
        <StreakModal user={user} onClose={() => setShowStreakInfo(false)} />
      )}

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num" style={{ color: user.dark }}>{currentDay}</div>
          <div className="stat-label">Current Day</div>
        </div>
        <button
          className="stat-card stat-card-btn"
          onClick={() => setShowStreakInfo(true)}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-num" style={{ color: user.dark }}>{streak}</div>
          <div className="stat-label">Day Streak 🔥</div>
          <div className="stat-hint">tap to learn more</div>
        </button>
        <div className="stat-card">
          <div className="stat-num" style={{ color: user.dark }}>{perfectDays}</div>
          <div className="stat-label">Perfect Days</div>
        </div>
      </div>

      {/* 75-day dot grid */}
      <div className="section-card">
        <h3 className="section-title">75 Day Journey</h3>
        <div className="dot-grid">
          {dots.map((dot) => (
            <div
              key={dot.day}
              className={`dot dot-${dot.status}`}
              title={`Day ${dot.day} — ${formatDate(dot.dateKey)}`}
              style={
                dot.status === 'perfect'
                  ? { background: '#f5c842', boxShadow: '0 0 0 2px #e8a800' }
                  : dot.status === 'streak'
                  ? { background: user.dark }
                  : dot.status === 'partial'
                  ? { background: user.primary }
                  : dot.status === 'future'
                  ? { background: '#e8e4df' }
                  : dot.status === 'missed'
                  ? { background: '#d4c5bf' }
                  : {}
              }
            >
              {dot.day === currentDay && (
                <span className="dot-today-ring" style={{ borderColor: user.dark }} />
              )}
            </div>
          ))}
        </div>
        <div className="dot-legend">
          <span><span className="legend-dot" style={{ background: '#f5c842', boxShadow: '0 0 0 2px #e8a800' }} /> Perfect</span>
          <span><span className="legend-dot" style={{ background: user.dark }} /> Streak</span>
          <span><span className="legend-dot" style={{ background: user.primary }} /> Partial</span>
          <span><span className="legend-dot" style={{ background: '#d4c5bf' }} /> Missed</span>
          <span><span className="legend-dot" style={{ background: '#e8e4df' }} /> Upcoming</span>
        </div>
      </div>

      {/* Recent 7 days bar chart */}
      <div className="section-card">
        <h3 className="section-title">Last 7 Days</h3>
        <div className="bar-chart">
          {recentDays.map((day) => (
            <div key={day.dateKey} className="bar-col">
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    height: `${maxCount > 0 ? (day.count / maxCount) * 100 : 0}%`,
                    background: day.count === maxCount && maxCount > 0 ? user.dark : user.primary,
                  }}
                />
              </div>
              <div className="bar-value" style={{ color: user.dark }}>{day.count}</div>
              <div className="bar-label">{day.label.split(' ')[0]}</div>
              <div className="bar-date">{day.label.split(' ')[1]}</div>
            </div>
          ))}
        </div>
        <div className="bar-max-label">Goals completed (out of {maxCount})</div>
      </div>
    </div>
  );
}
