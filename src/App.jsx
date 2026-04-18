import { useState } from 'react';
import { USERS } from './config';
import { useLocalStorage } from './useStorage';
import TodayView from './components/TodayView';
import ProgressView from './components/ProgressView';
import './App.css';

export default function App() {
  const [activeUser, setActiveUser] = useLocalStorage('75hard_activeUser', 'hannah');
  const [view, setView] = useState('today');

  const user = USERS[activeUser];
  const storageKey = `75hard_${user.id}_data`;
  const [data, setData] = useLocalStorage(storageKey, { startDate: null, days: {} });

  return (
    <div className="app" style={{ '--primary': user.primary, '--dark': user.dark, '--light': user.light }}>
      <header className="header">
        <div className="header-inner">
          <h1 className="app-title">75 Hard</h1>
          <div className="user-switcher">
            {Object.values(USERS).map((u) => (
              <button
                key={u.id}
                className={`user-btn ${activeUser === u.id ? 'active' : ''}`}
                onClick={() => setActiveUser(u.id)}
                style={activeUser === u.id ? { background: 'rgba(255,255,255,0.3)', color: '#fff' } : { background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}
              >
                {u.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <nav className="tab-nav">
        <button
          className={`tab-btn ${view === 'today' ? 'active' : ''}`}
          onClick={() => setView('today')}
        >
          Today
        </button>
        <button
          className={`tab-btn ${view === 'progress' ? 'active' : ''}`}
          onClick={() => setView('progress')}
        >
          Progress
        </button>
      </nav>

      <main className="main">
        {view === 'today' ? (
          <TodayView key={user.id} user={user} data={data} setData={setData} />
        ) : (
          <ProgressView key={user.id} user={user} data={data} />
        )}
      </main>
    </div>
  );
}
