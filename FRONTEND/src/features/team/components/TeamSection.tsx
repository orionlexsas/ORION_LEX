import { useTranslation } from 'react-i18next';
import type { TeamContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/cn';

interface TeamSectionProps {
  id: string;
  content: TeamContent;
  headingLevel?: 'h1' | 'h2';
  className?: string;
}

/** Nosotros: quién atenderá al cliente. Misión y visión (si existen) van después, en segundo plano. */
export function TeamSection({ id, content, headingLevel = 'h2', className }: TeamSectionProps) {
  const titleId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn('scroll-mt-20 section-spacing', className)}
    >
      <Container>
        <SectionHeading
          id={titleId}
          as={headingLevel}
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
        />
        <ul
          className={cn(
            'mt-10 grid gap-6 sm:grid-cols-2 lg:mt-12',
            content.members.length >= 3 ? 'lg:grid-cols-3' : 'lg:max-w-4xl',
          )}
        >
          {content.members.map((member, i) => (
            <TeamCard key={`${member.name}-${i}`} member={member} />
          ))}
        </ul>

        {content.values && (
          <div className="mt-16 border-t border-border pt-12">
            <h3 className="font-serif text-2xl font-semibold">{content.values.title}</h3>
            <dl className="mt-6 grid gap-8 md:grid-cols-2">
              {content.values.items.map((value) => (
                <div key={value.title}>
                  <dt className="font-semibold">{value.title}</dt>
                  <dd className="mt-2 leading-relaxed text-muted">{value.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Container>
    </section>
  );
}

function TeamCard({ member }: { member: TeamContent['members'][number] }) {
  const { t } = useTranslation();
  return (
    <li className="overflow-hidden rounded-lg border border-border bg-background">
      <img
        src={member.photo.src}
        alt={member.photo.alt}
        loading="lazy"
        decoding="async"
        width={480}
        height={710}
        className="aspect-[4/5] w-full object-cover object-top"
      />
      <div className="p-6">
        {member.status === 'provisional' && (
          <p className="mb-3 inline-block rounded-sm bg-accent/15 px-2 py-0.5 text-xs font-semibold tracking-wide text-accent-text uppercase">
            {t('team.pending')}
          </p>
        )}
        <h3 className="font-serif text-2xl font-semibold">{member.name}</h3>
        <p className="mt-1 font-medium">{member.role}</p>
        <p className="text-sm text-accent-text">{member.specialty}</p>
        <p className="mt-4 leading-relaxed text-muted">{member.bio}</p>
      </div>
    </li>
  );
}
