import PlayerRow from './PlayerRow';

const COLUMNS = [
  ['id', 'Número'],
  ['name', 'Nombre'],
  ['position', 'Posición'],
  ['age', 'Edad'],
  ['goals', 'Goles']
];

const arrow = (cfg, key) =>
  cfg.key === key ? (cfg.direction === 'asc' ? ' ↑' : cfg.direction === 'desc' ? ' ↓' : '') : '';

export default function PlayerTable({
  players, onRowClick, onSort, sortConfig, darkMode, rowColors, favorites, onToggleFavorite
}) {
  const colorFor = (index) => {
    const n = index + 1;
    if (rowColors === 'pares' && n % 2 === 0) return 'row--even';
    if (rowColors === 'impares' && n % 2 === 1) return 'row--odd';
    return '';
  };

  return (
    <div className="table-wrap">
      <table className={`table${darkMode ? ' table--dark' : ''}`}>
        <thead>
          <tr>
            {COLUMNS.map(([key, label]) => (
              <th key={key} className="table__th" onClick={() => onSort(key)}>
                {label}{arrow(sortConfig, key)}
              </th>
            ))}
            <th aria-label="Favorito" />
          </tr>
        </thead>
        <tbody>
          {players.length === 0 && (
            <tr>
              <td className="table__empty" colSpan={6}>No hay jugadores que coincidan con tu búsqueda.</td>
            </tr>
          )}
          {players.map((player, index) => (
            <PlayerRow
              key={player.id}
              player={player}
              index={index}
              onClick={onRowClick}
              isFavorite={favorites.includes(player.id)}
              onToggleFavorite={onToggleFavorite}
              darkMode={darkMode}
              colorClass={colorFor(index)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
