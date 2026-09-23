import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import '@fontsource-variable/figtree';
import '@fontsource/libre-caslon-text/700.css';
import '@fontsource/libre-caslon-text/400-italic.css';
import '@fontsource/cinzel/600.css';
import '@fontsource/allura/400.css';
import '@/styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
