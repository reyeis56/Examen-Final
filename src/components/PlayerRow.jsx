export default function PlayerRow({
  player, index, onClick, isFavorite, onToggleFavorite, darkMode, colorClass
}) {
  return (
    <tr
      className={`row ${colorClass}${darkMode ? ' row--dark' : ''}`}
      data-index={index}
      onClick={() => onClick(player)}
    >
      <td>{player.id}</td>
      <td>{player.name}</td>
      <td>{player.position}</td>
      <td>{player.age}</td>
      <td>{player.goals}</td>
      <td>
        <button
          className="row__star"
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(player.id);
          }}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </td>
    </tr>
  );
}
