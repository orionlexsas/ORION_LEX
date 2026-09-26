import type { FaqItem } from '@orion-lex/shared';
import { StructuredData } from '@/components/seo/StructuredData';

/**
 * Datos estructurados schema.org/FAQPage: permiten que Google muestre las preguntas
 * directamente en los resultados de búsqueda.
 */
export function FaqStructuredData({ items }: { items: FaqItem[] }) {
  return (
    <StructuredData
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }}
    />
  );
}
