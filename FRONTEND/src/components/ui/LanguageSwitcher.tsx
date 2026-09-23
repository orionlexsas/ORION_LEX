import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '@/i18n';
import { cn } from '@/lib/cn';

/** Selector de idioma ES / EN. La elección queda guardada en el navegador. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className={cn('flex h-11 items-center rounded-full border border-border p-1', className)}
    >
      {supportedLanguages.map((language) => {
        const active = i18n.resolvedLanguage === language;
        return (
          <button
            key={language}
            type="button"
            lang={language}
            aria-pressed={active}
            aria-label={t('language.switchTo', { language: t(`language.names.${language}`) })}
            onClick={() => void i18n.changeLanguage(language)}
            className={cn(
              'h-full min-w-10 rounded-full px-2.5 text-sm font-semibold tracking-wide uppercase transition-colors duration-300',
              active ? 'bg-gold text-on-gold' : 'text-foreground/75 hover:text-gold',
            )}
          >
            {language}
          </button>
        );
      })}
    </div>
  );
}
