import type { ServicesContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';
import { FeaturedServiceCard } from './FeaturedServiceCard';
import { ServiceCard } from './ServiceCard';
import { ServicesHeader } from './ServicesHeader';

interface ServicesSectionProps {
  id: string;
  content: ServicesContent;
}

/**
 * Cuadrícula de servicios según el orden del JSON:
 * 1.º destacado · 2.º y 3.º medianos · 4.º ancho · el resto en filas de tres.
 */
export function ServicesSection({ id, content }: ServicesSectionProps) {
  const [featured, ...others] = content.items;
  const medium = others.slice(0, 2);
  const wide = others[2];
  const rest = others.slice(3);
  const titleId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className="relative scroll-mt-24 overflow-hidden py-16 lg:py-16"
    >
      <Container size="wide">
        <ServicesHeader content={content} titleId={titleId} />

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-[1.42fr_1fr_1.03fr] lg:grid-rows-[minmax(15.6rem,auto)_minmax(11.4rem,auto)]">
          {featured && (
            <FeaturedServiceCard
              service={featured}
              featured={content.featured}
              linkLabel={content.linkLabel}
              className="md:col-span-2 lg:col-span-1 lg:row-span-2"
            />
          )}
          {medium.map((service) => (
            <ServiceCard
              key={service.slug}
              service={service}
              layout="stacked"
              linkLabel={content.linkLabel}
              imageWidth="w-[42%]"
            />
          ))}
          {wide && (
            <ServiceCard
              service={wide}
              layout="inline"
              linkLabel={content.linkLabel}
              imageWidth="w-[42%] md:w-[60%]"
              className="md:col-span-2"
            />
          )}
        </div>

        {rest.length > 0 && (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((service) => (
              <ServiceCard
                key={service.slug}
                service={service}
                layout="inline"
                linkLabel={content.linkLabel}
                imageWidth="w-[38%]"
                // En tablet (2 columnas), si la última queda sola ocupa toda la fila.
                className="lg:min-h-[12.5rem] md:max-lg:odd:last:col-span-2"
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
