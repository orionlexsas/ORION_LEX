/**
 * Línea naranja "dibujada a mano" que sale de la frase manuscrita y baja hasta el punto de cada
 * etapa. Coordenadas en un lienzo de 1000 × 120 que se estira al ancho de la cuadrícula; los
 * extremos caen en el centro de las tres columnas (x = 166, 500 y 834). El trazo no se deforma
 * al estirarse (vector-effect). Solo se muestra en escritorio (3 columnas).
 */
export function ProcessConnector() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 120"
      preserveAspectRatio="none"
      className="pointer-events-none hidden h-24 w-full text-accent lg:block xl:h-28"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        {/* Etapa 1 → etapa 2 → sube hacia la frase, gira y baja a la etapa 3 */}
        <path
          vectorEffect="non-scaling-stroke"
          d="M166 118 C166 100 180 97 215 97 L470 100 C530 101 600 88 665 58 C735 26 830 8 925 6 C975 5 985 26 950 44 C895 70 842 78 836 104 L834 118"
        />
        {/* Rama hacia la etapa 2 */}
        <path vectorEffect="non-scaling-stroke" d="M492 100 C500 102 500 108 500 118" />
      </g>
    </svg>
  );
}
