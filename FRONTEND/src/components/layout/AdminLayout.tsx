import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import {
  Briefcase,
  ChartColumnIncreasing,
  ChevronDown,
  ExternalLink,
  FileText,
  Image,
  LayoutGrid,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { AdminUser } from '@orion-lex/shared';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/cn';

/** Secciones del menú lateral del panel. */
const NAV: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/admin/noticias', label: 'Noticias', icon: FileText },
  { to: '/admin/servicios', label: 'Servicios', icon: Briefcase },
  { to: '/admin/fotos', label: 'Fotos y banners', icon: Image },
  { to: '/admin/estadisticas', label: 'Estadísticas', icon: ChartColumnIncreasing },
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings },
];

interface AdminLayoutProps {
  user: AdminUser;
  onLogout: () => void;
}

/** Lo que reciben las páginas del panel con useOutletContext(). */
export interface AdminOutletContext {
  user: AdminUser;
}

/** Estructura del panel: menú lateral negro, barra superior y el contenido de cada sección. */
export function AdminLayout({ user, onLogout }: AdminLayoutProps) {
  const { pathname } = useLocation();
  // En móvil el menú queda abierto solo en la sección donde se abrió: al navegar se cierra solo.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const setMenuOpen = (open: boolean) => setMenuPath(open ? pathname : null);

  return (
    <div className="min-h-dvh bg-surface">
      <Sidebar className="fixed inset-y-0 left-0 z-30 hidden w-[17rem] lg:flex" />

      {/* Menú en móvil y tableta: panel deslizable */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />
          <Sidebar
            className="relative flex h-full w-[17rem] max-w-[85vw]"
            onClose={() => setMenuOpen(false)}
          />
        </div>
      )}

      <div className="lg:pl-[17rem]">
        <TopBar user={user} onLogout={onLogout} onOpenMenu={() => setMenuOpen(true)} />
        <main className="mx-auto max-w-[110rem] px-4 py-8 sm:px-6 lg:px-9 lg:py-10">
          <Outlet context={{ user } satisfies AdminOutletContext} />
        </main>
      </div>
    </div>
  );
}

function Sidebar({ className, onClose }: { className?: string; onClose?: () => void }) {
  return (
    <aside className={cn('on-dark flex-col bg-ink', className)} aria-label="Menú del panel">
      <div className="flex items-center justify-between px-7 pt-7 pb-6">
        <Link
          to="/admin"
          className="flex items-center gap-2.5"
          aria-label="Orión Lex · inicio del panel"
        >
          <img
            src="/brand/escudo-blanco.webp"
            alt=""
            width={253}
            height={192}
            className="h-11 w-auto"
          />
          <img
            src="/brand/wordmark-blanco.webp"
            alt=""
            width={474}
            height={120}
            className="h-8 w-auto"
          />
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="grid size-10 cursor-pointer place-items-center rounded-lg text-white/80 hover:bg-white/10"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        )}
      </div>
      <div aria-hidden="true" className="mx-7 h-px bg-white/12" />

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-1.5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-4 rounded-xl border-l-[3px] px-4 py-3 text-[0.97rem] font-medium transition-colors',
                    isActive
                      ? 'border-accent bg-accent/15 text-accent'
                      : 'border-transparent text-white/85 hover:bg-white/6 hover:text-white',
                  )
                }
              >
                <Icon aria-hidden="true" className="size-5.5 shrink-0" strokeWidth={1.6} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-7 border-t border-white/12 py-6 text-xs leading-relaxed text-white/60">
        Orión Lex Servicios Jurídicos
        <br />
        Panel administrativo
        <br />
        v1.0.0
      </div>
    </aside>
  );
}

interface TopBarProps extends AdminLayoutProps {
  onOpenMenu: () => void;
}

function TopBar({ user, onLogout, onOpenMenu }: TopBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const search = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/admin/noticias${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex h-[4.75rem] items-center gap-3 px-4 sm:px-6 lg:px-9">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menú"
          className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-lg border border-border lg:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>

        <form role="search" onSubmit={search} className="relative hidden max-w-md flex-1 sm:block">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar noticias…"
            aria-label="Buscar noticias"
            className="h-11 w-full rounded-xl border border-border bg-surface pr-4 pl-12 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-5">
          <ThemeSwitch />
          <span aria-hidden="true" className="hidden h-8 w-px bg-border sm:block" />
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}

/** Interruptor sol / luna de la maqueta. */
function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Tema oscuro"
      onClick={toggleTheme}
      className="flex cursor-pointer items-center gap-2 rounded-full p-1 text-muted"
    >
      <Sun aria-hidden="true" className={cn('size-5', !isDark && 'text-accent')} />
      <span
        className={cn(
          'relative block h-6 w-11 shrink-0 rounded-full transition-colors',
          isDark ? 'bg-foreground/25' : 'bg-accent',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 block size-5 rounded-full bg-white shadow transition-transform duration-200',
            isDark ? 'translate-x-0' : 'translate-x-5',
          )}
        />
      </span>
      <Moon aria-hidden="true" className={cn('size-5', isDark && 'text-accent')} />
    </button>
  );
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((part) => /^\p{Lu}/u.test(part))
    .slice(0, 2)
    .map((part) => part[0])
    .join('') || name.slice(0, 1).toUpperCase();

function UserMenu({ user, onLogout }: AdminLayoutProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (
        event instanceof KeyboardEvent
          ? event.key === 'Escape'
          : !ref.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex cursor-pointer items-center gap-3 rounded-xl p-1 pr-2 hover:bg-foreground/5"
      >
        <span className="grid size-11 place-items-center rounded-full bg-ink font-serif text-base font-semibold text-accent ring-2 ring-accent/30">
          {initials(user.name)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm leading-tight font-semibold">{user.name}</span>
          <span className="block text-xs text-muted">{user.role}</span>
        </span>
        <ChevronDown aria-hidden="true" className="size-4 text-muted" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-background py-1.5 shadow-lg"
        >
          <p className="truncate px-4 py-2 text-xs text-muted">{user.email}</p>
          <a
            role="menuitem"
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-foreground/5"
          >
            <ExternalLink aria-hidden="true" className="size-4" /> Ver sitio web
          </a>
          <button
            role="menuitem"
            type="button"
            onClick={onLogout}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-danger hover:bg-danger/8"
          >
            <LogOut aria-hidden="true" className="size-4" /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
