import { contentIconSchema, type ContentIcon as ContentIconName } from '@orion-lex/shared';
import { ContentIcon } from '@/components/ui/ContentIcon';
import { cn } from '@/lib/cn';

/** Nombre de cada ícono en español (para el lector de pantalla y el título al pasar el mouse). */
const ICON_LABELS: Record<ContentIconName, string> = {
  user: 'Persona',
  users: 'Personas',
  clock: 'Reloj',
  phone: 'Teléfono',
  mail: 'Correo',
  'map-pin': 'Ubicación',
  globe: 'Mundo',
  laptop: 'Computador',
  scale: 'Balanza',
  briefcase: 'Maletín',
  landmark: 'Edificio público',
  gavel: 'Mazo',
  'file-text': 'Documento',
  'file-search': 'Buscar documento',
  messages: 'Conversación',
  route: 'Ruta',
  'shield-check': 'Escudo',
  handshake: 'Acuerdo',
  heart: 'Apoyo',
  'credit-card': 'Tarjeta',
  car: 'Vehículo',
  'file-pen': 'Firmar documento',
  hospital: 'Ambulancia',
  'message-circle': 'Mensaje',
};

interface IconSelectProps {
  value: ContentIconName;
  onChange: (icon: ContentIconName) => void;
}

/** Elegir el ícono de una tarjeta entre los disponibles en la web. */
export function IconSelect({ value, onChange }: IconSelectProps) {
  return (
    <div role="radiogroup" aria-label="Ícono" className="flex flex-wrap gap-1.5">
      {contentIconSchema.options.map((icon) => (
        <button
          key={icon}
          type="button"
          role="radio"
          aria-checked={value === icon}
          aria-label={ICON_LABELS[icon]}
          title={ICON_LABELS[icon]}
          onClick={() => onChange(icon)}
          className={cn(
            'grid size-10 cursor-pointer place-items-center rounded-lg border transition-colors',
            value === icon
              ? 'border-accent bg-accent/12 text-accent-text'
              : 'border-border text-muted hover:border-accent/50 hover:text-foreground',
          )}
        >
          <ContentIcon name={icon} className="size-5" strokeWidth={1.6} />
        </button>
      ))}
    </div>
  );
}
