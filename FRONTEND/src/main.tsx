import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { initAnalytics } from '@/lib/analytics';
import '@/i18n';
// Tipografías del manual de identidad: Playfair Display (títulos) y Montserrat (textos).
import '@fontsource-variable/playfair-display';
import '@fontsource-variable/montserrat';
import '@/styles/globals.css';

initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
