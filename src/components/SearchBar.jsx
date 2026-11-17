export default function SearchBar({ value, onChange, onClear, resultsCount }) {
  return (
    <div className="search">
      <div className="search__box">
        <input
          className="search__input"
          type="text"
          placeholder="Buscar jugador por nombre"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button className="search__clear" onClick={onClear} aria-label="Limpiar búsqueda">
            ✕
          </button>
        )}
      </div>
      <p className="search__count">Mostrando {resultsCount} resultados</p>
    </div>
  );
}
