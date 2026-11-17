import { useState } from 'react';

export default function SearchHistory({ history, onSelectSearch, onClearHistory }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="history">
      <button className="btn" onClick={() => setOpen((o) => !o)} disabled={history.length === 0}>
        Historial ({history.length}) ▾
      </button>
      {open && history.length > 0 && (
        <ul className="history__list">
          {history.map((s) => (
            <li key={s}>
              <button
                className="history__item"
                onClick={() => {
                  onSelectSearch(s);
                  setOpen(false);
                }}
              >
                {s}
              </button>
            </li>
          ))}
          <li>
            <button
              className="history__clear"
              onClick={() => {
                onClearHistory();
                setOpen(false);
              }}
            >
              Limpiar historial
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
