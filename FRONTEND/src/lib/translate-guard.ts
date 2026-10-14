/**
 * Evita que la página se caiga cuando Chrome (u otro navegador) la traduce automáticamente.
 *
 * El traductor cambia los textos por elementos <font> propios; luego React intenta quitar o
 * insertar nodos junto a textos que ya no están donde los dejó y el navegador lanza
 * "insertBefore/removeChild: el nodo no es hijo de este nodo", lo que tumba la aplicación.
 * Con esta protección esas operaciones imposibles se ignoran y la página sigue funcionando.
 * Es la solución conocida para el problema de React con Google Translate (facebook/react#11538).
 */
export function guardAgainstPageTranslation() {
  if (typeof Node !== 'function') return;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function removeChild<T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function insertBefore<T extends Node>(
    this: Node,
    node: T,
    reference: Node | null,
  ): T {
    if (reference && reference.parentNode !== this) return node;
    return originalInsertBefore.call(this, node, reference) as T;
  };
}

/** Marca el documento como español y "no traducir" (el panel solo existe en español). */
export function lockDocumentToSpanish() {
  document.documentElement.lang = 'es';
  document.documentElement.setAttribute('translate', 'no');
}
