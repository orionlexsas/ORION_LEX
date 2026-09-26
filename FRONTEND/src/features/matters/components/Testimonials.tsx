import { useTranslation } from 'react-i18next';
import { Quote, UserRound } from 'lucide-react';
import type { LandingContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';

type TestimonialsContent = NonNullable<LandingContent['testimonials']>;
type Testimonial = TestimonialsContent['items'][number];

/**
 * "Lo que dicen nuestros clientes". Solo muestra reseñas reales del JSON: mientras la lista
 * esté vacía, la sección no aparece en la web publicada. En desarrollo (npm run dev) se ven
 * tres tarjetas "PENDIENTE" para revisar el diseño.
 */
export function Testimonials({ testimonials }: { testimonials: TestimonialsContent }) {
  const { t } = useTranslation();
  const pending = testimonials.items.length === 0;
  if (pending && !import.meta.env.DEV) return null;

  const items: (Testimonial | null)[] = pending ? [null, null, null] : testimonials.items;

  return (
    <section aria-labelledby="landing-testimonials" className="section-spacing">
      <Container>
        <SectionHeading id="landing-testimonials" title={testimonials.title} />
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((item, i) =>
            item ? (
              <TestimonialCard key={item.name} testimonial={item} />
            ) : (
              <li
                key={i}
                className="grid min-h-48 place-items-center rounded-lg border-2 border-dashed border-accent/60 p-6 text-center text-sm font-semibold tracking-wide text-accent-text uppercase"
              >
                {t('landing.testimonialPending')}
              </li>
            ),
          )}
        </ul>
      </Container>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <li className="flex flex-col rounded-lg border border-border p-6">
      <Quote className="size-7 text-accent" aria-hidden="true" />
      <blockquote className="mt-4 flex-1 leading-relaxed text-foreground/85">
        {testimonial.text}
      </blockquote>
      <div className="mt-6 flex items-center gap-3">
        {testimonial.photo ? (
          <img
            src={testimonial.photo.src}
            alt={testimonial.photo.alt}
            loading="lazy"
            className="size-12 rounded-full object-cover"
          />
        ) : (
          <span className="grid size-12 place-items-center rounded-full bg-surface">
            <UserRound className="size-6 text-muted" aria-hidden="true" />
          </span>
        )}
        <p className="font-semibold">{testimonial.name}</p>
      </div>
    </li>
  );
}
