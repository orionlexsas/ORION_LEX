import {
  BriefcaseBusiness,
  ChartColumn,
  Clock3,
  createLucideIcon,
  FileSearch,
  FileText,
  Gavel,
  Landmark,
  MapPin,
  MessagesSquare,
  Phone,
  Scale,
  UserRound,
  UsersRound,
  type LucideProps,
} from 'lucide-react';
import type { ContentIcon as ContentIconName } from '@orion-lex/shared';

// Sobre con el rectángulo dibujado antes que la solapa, para que funcione también relleno.
const Mail = createLucideIcon('mail', [
  ['rect', { x: '2', y: '4', width: '20', height: '16', rx: '2', key: 'body' }],
  ['path', { d: 'm22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7', key: 'flap' }],
]);

const icons = {
  user: UserRound,
  clock: Clock3,
  chart: ChartColumn,
  phone: Phone,
  mail: Mail,
  'map-pin': MapPin,
  scale: Scale,
  briefcase: BriefcaseBusiness,
  users: UsersRound,
  landmark: Landmark,
  gavel: Gavel,
  'file-text': FileText,
  messages: MessagesSquare,
  'file-search': FileSearch,
} satisfies Record<ContentIconName, unknown>;

/** Traduce el nombre de ícono guardado en el JSON de contenido a su componente. */
export function ContentIcon({ name, ...props }: { name: ContentIconName } & LucideProps) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" {...props} />;
}
