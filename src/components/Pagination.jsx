export default function Pagination({
  currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange, totalItems
}) {
  const from = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);
  const first = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => first + i);

  return (
    <div className="pagination">
      <span className="pagination__info">Mostrando {from}-{to} de {totalItems} registros</span>

      <div className="pagination__nav">
        <button className="pagination__btn" onClick={() => onPageChange(1)} disabled={currentPage === 1}>Primera</button>
        <button className="pagination__btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
        {pages.map((p) => (
          <button
            key={p}
            className={`pagination__btn${p === currentPage ? ' pagination__btn--active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        <button className="pagination__btn" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Siguiente</button>
        <button className="pagination__btn" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>Última</button>
      </div>

      <label className="pagination__size">
        Por página{' '}
        <select value={itemsPerPage} onChange={(e) => onItemsPerPageChange(Number(e.target.value))}>
          {[5, 10, 20].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
