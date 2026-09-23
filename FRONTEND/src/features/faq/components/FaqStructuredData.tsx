import type { FaqContent } from '@orion-lex/shared';

/**
 * Datos estructurados schema.org/FAQPage: permiten que Google muestre las preguntas
 * directamente en los resultados de búsqueda.
 */
export function FaqStructuredData({ items }: { items: FaqContent['items'] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  // Se escapa "<" para que ningún texto pueda cerrar la etiqueta <script> antes de tiempo.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
