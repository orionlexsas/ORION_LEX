import { siWhatsapp } from 'simple-icons';

/** Logo oficial de WhatsApp (simple-icons, CC0). Hereda el color del texto. */
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d={siWhatsapp.path} />
    </svg>
  );
}
