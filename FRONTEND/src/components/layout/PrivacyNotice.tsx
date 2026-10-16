import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
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

/** Páginas donde se lee la política: ahí no se oscurece el fondo para poder leerla. */
const LEGAL_PAGES = ['/privacidad', '/terminos'];

/**
 * Aviso de tratamiento de datos personales (Ley 1581 de 2012) al entrar a la web: franja blanca
 * abajo a todo el ancho (ícono, título, texto, enlaces a la política y los términos y "Acepto")
 * con el resto de la página oscurecido hasta aceptar. Aparece cuando termina el video de intro
 * y, una vez aceptado, no vuelve a salir en ese navegador.
 */
export function PrivacyNotice() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
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

  const reading = LEGAL_PAGES.includes(pathname);
  const link =
    'text-[0.92rem] text-foreground/80 underline underline-offset-4 transition-colors hover:text-accent-text';

  return (
    <>
      {/* Fondo oscurecido: la web queda detrás hasta aceptar (salvo al leer la política). */}
      {!reading && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[119] animate-[fade-in_0.4s_ease-out_both] bg-black/55 backdrop-blur-[2px]"
        />
      )}
      <section
        role="dialog"
        aria-modal={!reading}
        aria-labelledby="privacy-notice-title"
        aria-describedby="privacy-notice-text"
        className="fixed inset-x-0 bottom-0 z-[120] animate-rise border-t border-border bg-background text-foreground shadow-[0_-18px_50px_-20px_rgb(0_0_0/0.45)]"
      >
        <div className="mx-auto flex max-w-[90rem] flex-col gap-5 px-5 py-5 sm:px-8 sm:py-6 lg:flex-row lg:items-center lg:gap-10">
          <div className="flex flex-1 items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent/10 text-accent max-sm:hidden">
              <ShieldCheck aria-hidden="true" className="size-6" strokeWidth={1.7} />
            </span>
            <div>
              <p id="privacy-notice-title" className="text-[1.05rem] font-semibold sm:text-lg">
                {t('privacyNotice.title')}
              </p>
              <p
                id="privacy-notice-text"
                className="mt-1.5 text-[0.9rem] leading-relaxed text-foreground/70 sm:text-[0.95rem]"
              >
                {t('privacyNotice.text')}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 max-lg:pl-0 sm:max-lg:pl-16">
            <Link to="/privacidad" className={link}>
              {t('privacyNotice.link')}
            </Link>
            <Link to="/terminos" className={link}>
              {t('privacyNotice.terms')}
            </Link>
            <button
              type="button"
              onClick={accept}
              autoFocus
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full bg-accent px-9 font-semibold tracking-wide text-on-accent uppercase shadow-sm transition-colors hover:bg-[color-mix(in_oklab,var(--color-accent)_88%,#000)] max-sm:w-full"
            >
              {t('privacyNotice.accept')}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
