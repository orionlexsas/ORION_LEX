/** Mueve un elemento de una lista una posición arriba (-1) o abajo (+1). */
export function move<T>(list: T[], index: number, step: -1 | 1): T[] {
  const target = index + step;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target]!, next[index]!];
  return next;
}
