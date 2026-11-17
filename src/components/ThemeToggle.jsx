export default function ThemeToggle({ darkMode, onToggle }) {
  return (
    <label className="toggle">
      <input className="toggle__input" type="checkbox" checked={darkMode} onChange={onToggle} />
      <span className="toggle__slider" />
      <span>{darkMode ? 'Modo oscuro' : 'Modo claro'}</span>
    </label>
  );
}
