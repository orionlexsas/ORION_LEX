import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';

/** Guarda que la persona ya aceptó (no vuelve a aparecer en este navegador). */
const ACCEPTED_KEY = 'orion-lex-datos';

const introRunning = () => {
  const { classList } = document.documentElement;
  return classList.contains('intro-pending') || classList.contains('intro-playing');
};

const alreadyAccepted = () => {
  try {
    return localStorage.getItem(ACCEPTED_KEY) === '1';
  } catch {
    return false;
  }
};

/**
 * Aviso de tratamiento de datos personales (Ley 1581 de 2012) al entrar a la web: tarjeta abajo
 * con el enlace a la política y el botón "Acepto". Aparece cuando termina el video de intro y,
 * una vez aceptado, no vuelve a salir en ese navegador.
 */
export function PrivacyNotice() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (alreadyAccepted()) return;
    const show = () => setVisible(true);
    if (!introRunning()) {
      const timer = window.setTimeout(show, 800);
      return () => window.clearTimeout(timer);
    }
    // Si corre el video de intro, se espera a que termine.
    const observer = new MutationObserver(() => {
      if (introRunning()) return;
      observer.disconnect();
      window.setTimeout(show, 800);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  const accept = () => {
    try {
      localStorage.setItem(ACCEPTED_KEY, '1');
    } catch {
      // Sin almacenamiento (navegación privada): se cierra igual, solo por esta visita.
    }
    setVisible(false);
  };

  return (
    <section
      role="region"
      aria-label={t('privacyNotice.label')}
      className="fixed inset-x-3 bottom-3 z-[120] mx-auto max-w-[34rem] animate-rise rounded-2xl border border-border bg-background p-5 text-foreground shadow-[0_24px_60px_-20px_rgb(0_0_0/0.45)] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:p-6"
    >
      <div className="flex items-start gap-3.5">
        <ShieldCheck
          aria-hidden="true"
          className="mt-0.5 size-6 shrink-0 text-accent"
          strokeWidth={1.7}
        />
        <div>
          <p className="font-serif text-lg font-semibold">{t('privacyNotice.title')}</p>
          <p className="mt-1.5 text-[0.92rem] leading-relaxed text-foreground/80">
            {t('privacyNotice.text')}{' '}
            <Link
              to="/privacidad"
              className="font-semibold text-accent-text underline underline-offset-4"
            >
              {t('privacyNotice.link')}
            </Link>
            .
          </p>
          <button
            type="button"
            onClick={accept}
            className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md bg-accent px-7 font-semibold text-on-accent transition-colors hover:bg-[color-mix(in_oklab,var(--color-accent)_88%,#000)] max-sm:w-full"
          >
            {t('privacyNotice.accept')}
          </button>
        </div>
      </div>
    </section>
  );
}
