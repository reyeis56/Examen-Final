export default function StatsPanel({ stats, darkMode }) {
  const max = Math.max(1, ...stats.byPosition.map(([, n]) => n));

  return (
    <section className={`stats${darkMode ? ' stats--dark' : ''}`}>
      <div className="stats__card">
        <span className="stats__label">Jugadores mostrados</span>
        <strong>{stats.total}</strong>
      </div>
      <div className="stats__card">
        <span className="stats__label">Promedio de edad</span>
        <strong>{stats.avgAge.toFixed(1)} años</strong>
      </div>
      <div className="stats__card">
        <span className="stats__label">Goleador principal</span>
        <strong>{stats.topScorer ? `${stats.topScorer.name} (${stats.topScorer.goals})` : '—'}</strong>
      </div>
      <div className="stats__card stats__card--wide">
        <span className="stats__label">Jugadores por posición</span>
        {stats.byPosition.map(([position, count]) => (
          <div className="bar" key={position}>
            <span>{position}</span>
            <div className="bar__track">
              <div className="bar__fill" style={{ width: `${(count / max) * 100}%` }} />
            </div>
            <span>{count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
