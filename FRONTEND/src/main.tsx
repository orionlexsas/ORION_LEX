import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { initAnalytics } from '@/lib/analytics';
import { guardAgainstPageTranslation, lockDocumentToSpanish } from '@/lib/translate-guard';
import '@/i18n';
// Tipografías del manual de identidad: Playfair Display (títulos) y Montserrat (textos).
import '@fontsource-variable/playfair-display';
import '@fontsource-variable/montserrat';
// Letra manuscrita solo para la frase decorativa de la portada ("Claridad para avanzar").
import '@fontsource/allura/latin-400.css';
import '@/styles/globals.css';

// Si el navegador traduce la página, que no se caiga (ver translate-guard).
guardAgainstPageTranslation();

const isAdmin = window.location.pathname.startsWith('/admin');
// El panel solo está en español: que el navegador no ofrezca traducirlo.
if (isAdmin) lockDocumentToSpanish();
// El panel (/admin) no carga analítica: sus visitas no son de clientes.
else initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
