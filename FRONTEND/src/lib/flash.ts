/*
 * Datos que sobreviven a una recarga de la página del panel: en local, al guardar cambia el
 * contenido de la web y Vite recarga la página (a veces antes de que llegue la respuesta).
 * Por eso el mensaje de "guardado" se deja listo ANTES de guardar y se borra si falla.
 */

function write(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    // Sin almacenamiento: el mensaje se ve igual mientras no se recargue.
  }
}

function take(key: string) {
  try {
    const value = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);
    return value;
  } catch {
    return null;
  }
}

const FLASH_KEY = 'orion-admin-flash';
const OPEN_KEY = 'orion-admin-open';

/** Mensaje para mostrar después de la recarga (o null para borrarlo). */
export const setFlash = (message: string | null) => write(FLASH_KEY, message);
export const takeFlash = () => take(FLASH_KEY);

/** Elemento que debe quedar abierto después de la recarga (p. ej. la noticia recién creada). */
export const setPendingOpen = (id: string | null) => write(OPEN_KEY, id);
export const takePendingOpen = () => take(OPEN_KEY);
