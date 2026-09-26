import { useRef, useState } from 'react';
import type { ServiceItem, ServicesContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/cn';
import { PracticeAreaCard } from './PracticeAreaCard';
import { PracticeAreaDialog } from './PracticeAreaDialog';

interface ServicesSectionProps {
  id: string;
  content: ServicesContent;
  className?: string;
}

/**
 * Servicios jurídicos generales (áreas del derecho). Cada tarjeta abre WhatsApp directamente
 * (asesoría jurídica) o una ventana con la explicación breve del área y su llamado.
 */
export function ServicesSection({ id, content, className }: ServicesSectionProps) {
  const titleId = `${id}-title`;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<ServiceItem>();

  const openDetails = (item: ServiceItem) => {
    setSelected(item);
    dialogRef.current?.showModal();
  };

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn('scroll-mt-20 section-spacing', className)}
    >
      <Container>
        <SectionHeading
          id={titleId}
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-5">
          {content.items.map((item) => (
            <li key={item.slug} className="grid">
              <PracticeAreaCard
                item={item}
                detailsLabel={content.detailsLabel}
                ctaLabel={content.ctaLabel}
                onOpenDetails={() => openDetails(item)}
              />
            </li>
          ))}
        </ul>
      </Container>

      <PracticeAreaDialog
        ref={dialogRef}
        item={selected}
        ctaLabel={content.ctaLabel}
        closeLabel={content.closeLabel}
      />
    </section>
  );
}
