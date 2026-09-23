import { describe, expect, it } from 'vitest';
import { circularOffset } from './use-carousel';

describe('circularOffset', () => {
  it('ubica la anterior a la izquierda y la siguiente a la derecha', () => {
    expect(circularOffset(0, 1, 3)).toBe(-1);
    expect(circularOffset(1, 1, 3)).toBe(0);
    expect(circularOffset(2, 1, 3)).toBe(1);
  });

  it('da la vuelta en los extremos (carrusel circular)', () => {
    // Activa la primera: la última queda a su izquierda.
    expect(circularOffset(2, 0, 3)).toBe(-1);
    // Activa la última: la primera queda a su derecha.
    expect(circularOffset(0, 2, 3)).toBe(1);
  });

  it('con más tarjetas, las lejanas quedan fuera de la vista (|offset| > 1)', () => {
    expect(circularOffset(3, 0, 6)).toBe(3);
    expect(Math.abs(circularOffset(4, 0, 6))).toBe(2);
  });
});
