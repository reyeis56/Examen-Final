import { useState, useEffect, useMemo } from 'react';
import { PLAYERS } from './data/players';
import SearchBar from './components/SearchBar';
import SearchHistory from './components/SearchHistory';
import PlayerTable from './components/PlayerTable';
import Pagination from './components/Pagination';
import StatsPanel from './components/StatsPanel';
import Modal from './components/Modal';
import ThemeToggle from './components/ThemeToggle';

const load = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchHistory, setSearchHistory] = useState(() => load('searchHistory', []));
  const [favorites, setFavorites] = useState(() => load('favorites', []));
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [darkMode, setDarkMode] = useState(() => load('darkMode', false));
  const [rowColors, setRowColors] = useState('none'); // 'none' | 'pares' | 'impares'
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'none' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce de 300ms con cleanup
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Modo oscuro: persistir y aplicar clase al body
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // Persistencia de favoritos
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Historial: últimas 5 búsquedas (mínimo 3 caracteres)
  useEffect(() => {
    if (debouncedSearch.trim().length > 2) {
      setSearchHistory((prev) =>
        [debouncedSearch, ...prev.filter((s) => s !== debouncedSearch)].slice(0, 5)
      );
    }
  }, [debouncedSearch]);

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // La paginación vuelve a la página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, showOnlyFavorites, itemsPerPage]);

  const filteredPlayers = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return PLAYERS.filter(
      (p) => p.name.toLowerCase().includes(term) && (!showOnlyFavorites || favorites.includes(p.id))
    );
  }, [debouncedSearch, showOnlyFavorites, favorites]);

  const sortedPlayers = useMemo(() => {
    if (!sortConfig.key || sortConfig.direction === 'none') return filteredPlayers;
    const dir = sortConfig.direction === 'asc' ? 1 : -1;
    return [...filteredPlayers].sort((a, b) => {
      const x = a[sortConfig.key];
      const y = b[sortConfig.key];
      return (typeof x === 'string' ? x.localeCompare(y) : x - y) * dir;
    });
  }, [filteredPlayers, sortConfig]);

  const stats = useMemo(() => {
    const total = filteredPlayers.length;
    const avgAge = total ? filteredPlayers.reduce((sum, p) => sum + p.age, 0) / total : 0;
    const topScorer = total ? filteredPlayers.reduce((max, p) => (p.goals > max.goals ? p : max)) : null;
    const counts = {};
    filteredPlayers.forEach((p) => {
      counts[p.position] = (counts[p.position] || 0) + 1;
    });
    return { total, avgAge, topScorer, byPosition: Object.entries(counts) };
  }, [filteredPlayers]);

  const totalPages = Math.max(1, Math.ceil(sortedPlayers.length / itemsPerPage));
  const start = (currentPage - 1) * itemsPerPage;
  const pagePlayers = sortedPlayers.slice(start, start + itemsPerPage);

  // Ciclo: sin ordenar → ascendente → descendente → sin ordenar
  const handleSort = (key) =>
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return { key: null, direction: 'none' };
    });

  const toggleFavorite = (id) =>
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));

  const openPlayer = (player) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearch('');
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Plantilla de jugadores</h1>
        <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode((d) => !d)} />
      </header>

      <StatsPanel stats={stats} darkMode={darkMode} />

      <div className="toolbar">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={clearSearch}
          resultsCount={filteredPlayers.length}
        />
        <SearchHistory
          history={searchHistory}
          onSelectSearch={setSearchTerm}
          onClearHistory={() => setSearchHistory([])}
        />
        <div className="toolbar__group">
          <button className="btn" onClick={() => setRowColors('pares')}>Pintar Pares</button>
          <button className="btn" onClick={() => setRowColors('impares')}>Pintar Impares</button>
          <button className="btn" onClick={() => setRowColors('none')}>Limpiar Colores</button>
          <label className="toolbar__fav">
            <input
              type="checkbox"
              checked={showOnlyFavorites}
              onChange={(e) => setShowOnlyFavorites(e.target.checked)}
            />
            Mostrar solo favoritos
          </label>
          <span className="toolbar__count">{favorites.length} favoritos guardados</span>
        </div>
      </div>

      <PlayerTable
        players={pagePlayers}
        onRowClick={openPlayer}
        onSort={handleSort}
        sortConfig={sortConfig}
        darkMode={darkMode}
        rowColors={rowColors}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        totalItems={sortedPlayers.length}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        player={selectedPlayer}
        darkMode={darkMode}
      />
    </div>
  );
}
