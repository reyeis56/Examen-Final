export default function Modal({ isOpen, onClose, player, darkMode }) {
  if (!player) return null;

  return (
    <div className={`modal${isOpen ? ' modal--open' : ''}`} onClick={onClose}>
      <div
        className={`modal__card${darkMode ? ' modal__card--dark' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        <h2 className="modal__title">{player.name}</h2>
        <p className="modal__number">Camiseta {player.id}</p>
        <dl className="modal__list">
          <dt>Posición</dt><dd>{player.position}</dd>
          <dt>Edad</dt><dd>{player.age} años</dd>
          <dt>Goles</dt><dd>{player.goals}</dd>
        </dl>
      </div>
    </div>
  );
}
