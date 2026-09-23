/** Valor de `href` en el contenido que significa "abrir WhatsApp". */
export const WHATSAPP_HREF = 'whatsapp';

/** Enlace de WhatsApp (wa.me) con el mensaje ya escrito. */
export function whatsappUrl(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
