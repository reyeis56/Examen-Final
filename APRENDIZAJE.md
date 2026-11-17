# APRENDIZAJE — Hooks de React en la tabla de jugadores

**IA utilizada:** Claude (Anthropic). Generó en gran medida el codigo del proyecto y la redacción del proyecto.

Todos los ejemplos salen de `src/App.jsx` y de los componentes del proyecto.

---

## a) ¿Qué es `useState` y cuándo usarlo?

### Explicación teórica

`useState` es el hook que le da **memoria** a un componente. Devuelve un par: el valor actual y una función para cambiarlo.

```jsx
const [valor, setValor] = useState(valorInicial);
```

- Cuando se llama a `setValor`, React vuelve a renderizar el componente con el nuevo valor.
- Una variable normal (`let x = 0`) se pierde en cada render y no avisa a React cuando cambia. El estado sí.
- Se usa para datos que **cambian con el tiempo y afectan lo que se ve**: texto de un input, página actual, si un modal está abierto, el tema, etc.
- No se usa para valores que se pueden calcular a partir de otros estados (por ejemplo, `totalPages` se calcula con `Math.ceil`, no se guarda en estado).
- Si el nuevo valor depende del anterior, se usa la forma funcional: `setX(prev => ...)`.

### Ejemplo 1: texto de búsqueda y página actual

```jsx
const [searchTerm, setSearchTerm] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
```

Cada letra que se escribe actualiza `searchTerm`. Los botones de paginación y el selector de 5/10/20 cambian `currentPage` e `itemsPerPage`.

### Ejemplo 2: ordenamiento con actualización funcional

```jsx
const [sortConfig, setSortConfig] = useState({ key: null, direction: 'none' });

const handleSort = (key) =>
  setSortConfig((prev) => {
    if (prev.key !== key) return { key, direction: 'asc' };
    if (prev.direction === 'asc') return { key, direction: 'desc' };
    return { key: null, direction: 'none' };
  });
```

El estado guarda un objeto con la columna activa y la dirección. Como el nuevo valor depende del anterior, se usa `prev`. Así se logra el ciclo sin ordenar → ascendente → descendente → sin ordenar.

### Ejemplo 3: favoritos (arreglo en estado) y modal

```jsx
const [favorites, setFavorites] = useState(() => load('favorites', []));
const [selectedPlayer, setSelectedPlayer] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);

const toggleFavorite = (id) =>
  setFavorites((prev) =>
    prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
  );
```

Los arreglos en estado **no se modifican directamente** (`push`, `splice`). Se crea uno nuevo con `filter` o con el operador spread `[...prev, id]`. El modal usa dos estados: quién es el jugador y si está abierto, lo que permite la animación de salida porque el jugador sigue guardado mientras se cierra.

---

## b) ¿Qué es `useEffect` y sus casos de uso?

### Explicación del ciclo de vida

`useEffect` ejecuta código **después** de que React pinta el componente en pantalla. Sirve para efectos secundarios: temporizadores, `localStorage`, peticiones a una API, eventos del navegador, cambios en el DOM fuera de React.

```jsx
useEffect(() => {
  // 1. Se ejecuta después del render
  return () => {
    // 2. (opcional) cleanup: se ejecuta antes del siguiente efecto
    //    y cuando el componente se desmonta
  };
}, [dependencias]);
```

Ciclo de vida de un componente con `useEffect`:

1. **Montaje:** el componente aparece por primera vez, se renderiza y se ejecuta el efecto.
2. **Actualización:** cuando cambia una dependencia, React ejecuta primero el cleanup del efecto anterior y luego el efecto nuevo.
3. **Desmontaje:** el componente desaparece y se ejecuta el cleanup final.

### Diferencia entre `[]`, `[dep]` y sin array

| Forma | Cuándo se ejecuta | Uso típico |
| --- | --- | --- |
| `useEffect(fn, [])` | Solo una vez, al montar el componente | Cargar datos iniciales, suscribirse a un evento |
| `useEffect(fn, [dep])` | Al montar y cada vez que `dep` cambia | Reaccionar a un cambio concreto |
| `useEffect(fn)` (sin array) | Después de **cada** render | Casos raros; suele causar bucles o trabajo innecesario |

**En el proyecto con `[dep]`:**

```jsx
// Se ejecuta solo cuando cambia darkMode
useEffect(() => {
  localStorage.setItem('darkMode', JSON.stringify(darkMode));
  document.body.classList.toggle('dark-mode', darkMode);
}, [darkMode]);

// La paginación vuelve a la página 1 cuando cambian los filtros
useEffect(() => {
  setCurrentPage(1);
}, [debouncedSearch, showOnlyFavorites, itemsPerPage]);
```

**Con `[]`** (ejemplo de la guía del examen; en el proyecto el valor inicial se lee con la inicialización perezosa de `useState`, que logra lo mismo sin un render extra):

```jsx
useEffect(() => {
  const saved = localStorage.getItem('darkMode');
  if (saved) setDarkMode(JSON.parse(saved));
}, []); // solo al montar
```

**Sin array** (ejemplo didáctico, no se usa en el proyecto):

```jsx
useEffect(() => {
  console.log('Me ejecuto después de cada render');
});
```

### Ejemplo de cleanup function

```jsx
useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
  return () => clearTimeout(timer); // cleanup
}, [searchTerm]);
```

El detalle de cómo funciona está en la sección d).

---

## c) ¿Qué es `useMemo` y cuándo usarlo?

### Explicación

`useMemo` **guarda el resultado de un cálculo** y solo lo vuelve a calcular si cambian sus dependencias. Sin él, el cálculo se repetiría en cada render, aunque nada relacionado haya cambiado.

```jsx
const resultado = useMemo(() => calculoCostoso(a, b), [a, b]);
```

Se usa cuando el cálculo es costoso (filtrar, ordenar o recorrer listas grandes) o cuando el resultado se pasa como prop y conviene que mantenga la misma referencia. No hace falta para cálculos triviales: memorizar también tiene un costo.

### Diferencia con `useCallback`

| Hook | Qué memoriza | Devuelve |
| --- | --- | --- |
| `useMemo(() => fn(), [dep])` | El **resultado** de ejecutar una función | Un valor (número, arreglo, objeto) |
| `useCallback(fn, [dep])` | La **función misma** | La misma función entre renders |

`useCallback(fn, deps)` equivale a `useMemo(() => fn, deps)`. Se usa para pasar funciones estables a componentes hijos memorizados con `React.memo`. En este proyecto solo se usa `useMemo`.

### Ejemplo de optimización del proyecto

```jsx
const filteredPlayers = useMemo(() => {
  const term = debouncedSearch.trim().toLowerCase();
  return PLAYERS.filter(
    (p) =>
      p.name.toLowerCase().includes(term) &&
      (!showOnlyFavorites || favorites.includes(p.id))
  );
}, [debouncedSearch, showOnlyFavorites, favorites]);

const stats = useMemo(() => {
  const total = filteredPlayers.length;
  const avgAge = total
    ? filteredPlayers.reduce((sum, p) => sum + p.age, 0) / total
    : 0;
  const topScorer = total
    ? filteredPlayers.reduce((max, p) => (p.goals > max.goals ? p : max))
    : null;
  const counts = {};
  filteredPlayers.forEach((p) => {
    counts[p.position] = (counts[p.position] || 0) + 1;
  });
  return { total, avgAge, topScorer, byPosition: Object.entries(counts) };
}, [filteredPlayers]);
```

- `filteredPlayers` solo se recalcula si cambia la búsqueda (ya con debounce), el filtro de favoritos o la lista de favoritos.
- `stats` solo se recalcula cuando cambia `filteredPlayers`. Si el usuario abre el modal, cambia de tema o de página, las estadísticas **no** se recalculan.
- Hay una cadena de dependencias: `filteredPlayers` → `sortedPlayers` y `stats`. Por eso las estadísticas siempre reflejan los filtros activos.

---

## d) ¿Cómo funciona el cleanup en `useEffect`?

La función que se devuelve desde `useEffect` se llama **cleanup**. React la ejecuta:

1. **Antes de volver a ejecutar el efecto** cuando cambió alguna dependencia.
2. **Cuando el componente se desmonta.**

Sirve para deshacer lo que el efecto dejó pendiente: temporizadores, suscripciones, listeners de eventos. Si no se limpia, se acumulan efectos viejos y pueden aparecer errores o fugas de memoria.

### Ejemplo: el debounce del proyecto

```jsx
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm);
  }, 300);

  return () => clearTimeout(timer); // CLEANUP
}, [searchTerm]);
```

Paso a paso, si el usuario escribe "mat":

1. Escribe `m`: cambia `searchTerm`, el efecto crea un temporizador de 300 ms.
2. Escribe `a` a los 100 ms: `searchTerm` cambia otra vez. **Antes** de ejecutar el efecto nuevo, React corre el cleanup y `clearTimeout` cancela el temporizador de `m`. Luego se crea uno nuevo.
3. Escribe `t`: ocurre lo mismo, se cancela el de `ma` y se crea el de `mat`.
4. El usuario deja de escribir 300 ms: el temporizador de `mat` sí termina y actualiza `debouncedSearch`.

Resultado: el filtrado, las estadísticas y el historial solo se actualizan **una vez**, cuando el usuario hace una pausa, y no con cada tecla. Sin el `clearTimeout`, cada letra dispararía su propia actualización al cumplirse sus 300 ms.

---

## e) ¿Cómo funciona `localStorage` con React?

### Explicación

`localStorage` es un almacenamiento del navegador que **guarda pares clave-valor y no se borra al recargar** la página ni al cerrar la pestaña. Solo guarda texto (strings), por eso los arreglos y objetos se convierten con `JSON.stringify` al guardar y con `JSON.parse` al leer.

```js
localStorage.setItem('clave', JSON.stringify(valor)); // guardar
JSON.parse(localStorage.getItem('clave'));            // leer
```

En React se usa con dos hooks que se complementan:

- **Leer al iniciar:** con la inicialización perezosa de `useState` (una función que se ejecuta solo en el primer render).
- **Guardar al cambiar:** con `useEffect` que depende del estado.

### Ejemplo de persistencia del proyecto

```jsx
// Función auxiliar: lee y convierte, con valor por defecto si falla
const load = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

// 1. Leer al iniciar (inicialización perezosa)
const [darkMode, setDarkMode] = useState(() => load('darkMode', false));
const [favorites, setFavorites] = useState(() => load('favorites', []));
const [searchHistory, setSearchHistory] = useState(() => load('searchHistory', []));

// 2. Guardar cada vez que cambia el estado
useEffect(() => {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}, [favorites]);

useEffect(() => {
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}, [searchHistory]);
```

Por qué se hace así:

- La función `() => load(...)` se ejecuta solo una vez, al crear el componente. Así el estado arranca con lo guardado y no hay un parpadeo del valor por defecto.
- El `try/catch` evita que la aplicación se rompa si el navegador bloquea `localStorage` o si el contenido guardado está dañado.
- Los favoritos, el historial de las últimas 5 búsquedas y el modo oscuro **sobreviven a recargar la página**.

---

*Documento elaborado con ayuda de Claude (Anthropic) como IA utilizada.*
