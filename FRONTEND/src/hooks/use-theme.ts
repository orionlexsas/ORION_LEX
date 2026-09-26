import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

/** Misma clave que usa el script de index.html para aplicar el tema antes de pintar. */
const STORAGE_KEY = 'orion-lex-theme';
const THEME_COLORS: Record<Theme, string> = { dark: '#0a0a0a', light: '#ffffff' };

const listeners = new Set<() => void>();

/** Tema claro por defecto; index.html fija data-theme antes de pintar. */
function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Navegación privada o almacenamiento bloqueado: el tema dura solo esta visita.
  }
  listeners.forEach((listener) => listener());
}

/** Tema actual (claro/oscuro) y función para alternarlo. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => 'light' as Theme);
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  return { theme, toggleTheme };
}
