import type { FaqItem as FaqItemContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/cn';
import { FaqItem } from './FaqItem';
import { FaqStructuredData } from './FaqStructuredData';

interface FaqSectionProps {
  id: string;
  title: string;
  items: FaqItemContent[];
  className?: string;
}

/** Preguntas frecuentes en acordeón, con datos estructurados para Google. */
export function FaqSection({ id, title, items, className }: FaqSectionProps) {
  const titleId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn('scroll-mt-20 section-spacing', className)}
    >
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeading id={titleId} title={title} />
        <div className="border-t border-border">
          {items.map((item) => (
            <FaqItem key={item.question} item={item} />
          ))}
        </div>
      </Container>
      <FaqStructuredData items={items} />
    </section>
  );
}
