/**
 * Datos estructurados schema.org (JSON-LD) para buscadores.
 * Se escapa "<" para que ningún texto pueda cerrar la etiqueta <script> antes de tiempo.
 */
export function StructuredData({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
