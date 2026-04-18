import { useState } from 'react';
import { getTodayKey, getWeekStart, addDays, daysBetween, formatDate } from '../config';

export default function TodayView({ user, data, setData }) {
  const [selectedDate, setSelectedDate] = useState(getTodayKey());

  const today = getTodayKey();
  const isStarted = !!data.startDate;
  const isToday = selectedDate === today;

  // Clamp navigation: can't go before Day 1 or after today
  const canGoBack = isStarted && daysBetween(data.startDate, selectedDate) > 0;
  const canGoForward = selectedDate < today;

  const dayNumber = data.startDate
    ? Math.max(1, daysBetween(data.startDate, selectedDate) + 1)
    : null;

  const selectedData = data.days[selectedDate] || {};

  function handleStart() {
    setData((prev) => ({ ...prev, startDate: today, days: { ...prev.days } }));
  }

  function getWeeklyCount(goalId, dateKey) {
    if (!data.startDate) return 0;
    const weekStart = getWeekStart(dateKey);
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const dk = addDays(weekStart, i);
      const val = data.days[dk]?.[goalId];
      if (val) count += typeof val === 'number' ? val : 1;
    }
    return count;
  }

  function toggleGoal(goal) {
    if (!isStarted) return;
    setData((prev) => {
      const dayGoals = { ...(prev.days[selectedDate] || {}) };

      if (goal.type === 'daily') {
        dayGoals[goal.id] = !dayGoals[goal.id];
      } else if (goal.type === '3x') {
        const weekStart = getWeekStart(selectedDate);
        let weekTotal = 0;
        for (let i = 0; i < 7; i++) {
          const dk = addDays(weekStart, i);
          if (dk !== selectedDate) {
            const v = prev.days[dk]?.[goal.id];
            weekTotal += v ? (typeof v === 'number' ? v : 1) : 0;
          }
        }
        const current = dayGoals[goal.id] || 0;
        const remaining = Math.max(0, 3 - weekTotal);
        if (remaining === 0 && !current) return prev;
        dayGoals[goal.id] = current >= Math.min(remaining, 1) ? 0 : 1;
      } else if (goal.type === '1x') {
        dayGoals[goal.id] = !dayGoals[goal.id];
      }

      return { ...prev, days: { ...prev.days, [selectedDate]: dayGoals } };
    });
  }

  const allDailyDone = user.goals
    .filter((g) => g.type === 'daily')
    .every((g) => selectedData[g.id]);

  const weeklyGoalsMet = user.goals
    .filter((g) => g.type !== 'daily')
    .every((g) => {
      if (g.type === '3x') return getWeeklyCount(g.id, selectedDate) >= 3;
      if (g.type === '1x') return getWeeklyCount(g.id, selectedDate) >= 1;
      return false;
    });

  const dayComplete = allDailyDone && weeklyGoalsMet;

  return (
    <div className="today-view">
      {!isStarted ? (
        <div className="start-card">
          <div className="start-emoji">🌟</div>
          <h2 className="start-heading">Ready to start,<br />{user.name}?</h2>
          <p className="start-sub">75 days. Daily habits. Real change.</p>
          <button className="start-btn" onClick={handleStart}>
            Start Day 1
          </button>
        </div>
      ) : (
        <>
          <div className="day-header">
            <button
              className="nav-arrow"
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              disabled={!canGoBack}
              style={{ color: canGoBack ? user.dark : 'transparent' }}
              aria-label="Previous day"
            >
              ‹
            </button>

            <div className="day-header-center">
              <div className="day-badge">
                <span className="day-label">Day</span>
                <span className="day-num" style={{ color: user.dark }}>{dayNumber}</span>
                <span className="day-of">of 75</span>
              </div>
              <div className="date-row">
                <span className="date-text">{formatDate(selectedDate)}</span>
                {!isToday && (
                  <button
                    className="back-to-today"
                    style={{ color: user.dark }}
                    onClick={() => setSelectedDate(today)}
                  >
                    Back to today
                  </button>
                )}
              </div>
              {dayComplete && (
                <div className="complete-badge" style={{ background: user.dark }}>
                  {isToday ? 'Perfect Day! ✓' : 'Complete ✓'}
                </div>
              )}
            </div>

            <button
              className="nav-arrow"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              disabled={!canGoForward}
              style={{ color: canGoForward ? user.dark : 'transparent' }}
              aria-label="Next day"
            >
              ›
            </button>
          </div>

          {!isToday && (
            <div className="editing-banner" style={{ background: `${user.primary}33`, borderColor: user.primary }}>
              ✏️ Editing {formatDate(selectedDate)} — tap goals to update
            </div>
          )}

          {[
            { type: 'daily', label: 'Daily' },
            { type: '3x', label: '3× per Week' },
            { type: '1x', label: '1× per Week' },
          ].map(({ type, label }) => {
            const sectionGoals = user.goals.filter((g) => g.type === type);
            if (sectionGoals.length === 0) return null;
            return (
              <div key={type} className="goal-section">
                <div className="goal-section-label">{label}</div>
                <div className="goals-list">
                  {sectionGoals.map((goal) => (
                    <GoalItem
                      key={goal.id}
                      goal={goal}
                      value={selectedData[goal.id]}
                      weeklyCount={goal.type !== 'daily' ? getWeeklyCount(goal.id, selectedDate) : undefined}
                      onToggle={() => toggleGoal(goal)}
                      color={user.dark}
                      primary={user.primary}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function GoalItem({ goal, value, weeklyCount, onToggle, color, primary }) {
  const checked = !!value;

  return (
    <button
      className={`goal-item ${checked ? 'checked' : ''}`}
      onClick={onToggle}
      style={checked ? { borderColor: color, background: `${primary}22` } : {}}
    >
      <div className="goal-check" style={checked ? { background: color, borderColor: color } : {}}>
        {checked && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="goal-emoji">{goal.emoji}</span>
      <span className="goal-label">{goal.label}</span>
      {goal.type === '3x' && (
        <span className="goal-counter" style={{ color }}>
          {weeklyCount}/3
        </span>
      )}
      {goal.type === '1x' && (
        <span className="goal-counter" style={{ color }}>
          {weeklyCount >= 1 ? '✓' : '0/1'}
        </span>
      )}
    </button>
  );
}
