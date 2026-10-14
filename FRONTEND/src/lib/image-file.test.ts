import { describe, expect, it } from 'vitest';
import { centerCrop } from './image-file';

describe('centerCrop', () => {
  it('sin proporción deja la foto entera', () => {
    expect(centerCrop(800, 600)).toEqual({ x: 0, y: 0, width: 800, height: 600 });
  });

  it('a una foto vertical le quita arriba y abajo', () => {
    expect(centerCrop(1200, 1600, 1200 / 630)).toEqual({ x: 0, y: 485, width: 1200, height: 630 });
  });

  it('a una foto muy ancha le quita los lados', () => {
    expect(centerCrop(4000, 1000, 2)).toEqual({ x: 1000, y: 0, width: 2000, height: 1000 });
  });
});
