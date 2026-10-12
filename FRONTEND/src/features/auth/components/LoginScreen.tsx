import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import {
  ArrowRight,
  ChartNoAxesColumnIncreasing,
  Eye,
  EyeOff,
  FileText,
  Image,
  LoaderCircle,
  Lock,
  Mail,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { Notice } from '@/components/admin/Notice';
import { Logo } from '@/components/layout/Logo';
import { ApiRequestError } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { useAdminSession, useLogin } from '../hooks/use-session';

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: FileText, title: 'Gestiona noticias', text: 'Publica y edita contenido fácilmente.' },
  {
    icon: Image,
    title: 'Administra fotos y banners',
    text: 'Mantén el sitio siempre actualizado.',
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    title: 'Control total',
    text: 'Un panel seguro, rápido y fácil de usar.',
  },
];

const inputClass =
  'h-14 w-full rounded-xl border border-border bg-surface pr-4 pl-13 text-[0.95rem] text-foreground placeholder:text-muted transition-colors focus:border-accent focus:bg-background focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-accent/25';

function errorMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    if (error.code === 'ADMIN_NOT_CONFIGURED')
      return 'El acceso al panel aún no está configurado en el servidor.';
    if (error.code !== 'HTTP_ERROR') return error.message;
  }
  return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
}

/** Pantalla de acceso al panel (/admin/login): foto y beneficios a la izquierda, formulario a la derecha. */
export function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useAdminSession();
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/admin';
  if (session.data) return <Navigate to={from} replace />;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    loginMutation.mutate(
      { email, password, remember },
      { onSuccess: () => navigate(from, { replace: true }) },
    );
  };

  return (
    <div className="flex min-h-dvh bg-surface">
      {/* Izquierda: identidad (solo en pantallas grandes) */}
      <aside className="on-dark relative hidden w-[52%] overflow-hidden bg-ink lg:flex">
        <img
          src="/panel/login-justicia.webp"
          alt=""
          className="absolute inset-y-0 right-0 h-full w-auto max-w-none object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-ink)_45%,color-mix(in_oklab,var(--color-ink)_55%,transparent)_70%,transparent)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_35%,color-mix(in_oklab,var(--color-accent)_9%,transparent),transparent_55%)]"
        />

        <div className="relative flex max-w-xl flex-col justify-center px-14 py-16 xl:px-20">
          <div className="flex items-center gap-3">
            <img
              src="/brand/escudo-blanco.webp"
              alt=""
              width={253}
              height={192}
              className="h-16 w-auto"
            />
            <img
              src="/brand/wordmark-blanco.webp"
              alt="Orión Lex Servicios Jurídicos"
              width={474}
              height={120}
              className="h-12 w-auto"
            />
          </div>
          <span aria-hidden="true" className="mt-12 block h-1 w-14 rounded-full bg-accent" />
          <h2 className="mt-8 font-serif text-5xl leading-[1.12] font-semibold xl:text-[3.4rem]">
            Contenido legal que genera <span className="text-accent">confianza</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/85">
            Administra noticias, fotos y todo el contenido del sitio web de Orión Lex Servicios
            Jurídicos desde un solo lugar.
          </p>
          <ul className="mt-12 space-y-7">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-center gap-5">
                <span className="grid size-15 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5">
                  <Icon aria-hidden="true" className="size-7 text-white" strokeWidth={1.5} />
                </span>
                <span>
                  <span className="block text-lg font-medium">{title}</span>
                  <span className="block text-[0.95rem] text-white/75">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Derecha: formulario */}
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[36rem] rounded-3xl border border-border bg-background px-6 py-10 shadow-[0_24px_60px_-30px_rgb(0_0_0/0.35)] sm:px-12 sm:py-12">
          <Logo name="Orión Lex" className="justify-center" />

          <h1 className="mt-10 font-serif text-[2.4rem] leading-tight font-semibold">
            Acceso al panel
          </h1>
          <p className="mt-3 leading-relaxed text-muted">
            Ingresa para administrar noticias, fotos y contenido del sitio web de Orión Lex
            Servicios Jurídicos.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4" noValidate={false}>
            <label className="relative block">
              <span className="sr-only">Correo electrónico</span>
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4.5 size-5 -translate-y-1/2 text-muted"
              />
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                className={inputClass}
              />
            </label>

            <label className="relative block">
              <span className="sr-only">Contraseña</span>
              <Lock
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4.5 size-5 -translate-y-1/2 text-muted"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className={cn(inputClass, 'pr-14')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPassword}
                className="absolute top-1/2 right-2.5 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-muted hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="size-5" />
                ) : (
                  <Eye aria-hidden="true" className="size-5" />
                )}
              </button>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="flex cursor-pointer items-center gap-3 text-[0.95rem] font-medium">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-5 cursor-pointer rounded accent-accent"
                />
                Recordarme
              </label>
              <button
                type="button"
                onClick={() => setShowHelp((v) => !v)}
                aria-expanded={showHelp}
                className="cursor-pointer text-[0.95rem] font-medium text-accent-text hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {showHelp && (
              <Notice tone="info">
                Por seguridad, la contraseña solo se cambia desde la configuración del servidor.
                Pide al administrador técnico del sitio que la restablezca.
              </Notice>
            )}
            {loginMutation.isError && (
              <Notice tone="error">{errorMessage(loginMutation.error)}</Notice>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="mt-2 flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-accent text-[1.05rem] font-semibold text-on-accent shadow-[0_10px_24px_-12px_var(--color-accent)] transition-[background-color,transform] hover:bg-[color-mix(in_oklab,var(--color-accent)_88%,#000)] active:scale-[0.99] disabled:opacity-70"
            >
              {loginMutation.isPending ? (
                <>
                  <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> Ingresando…
                </>
              ) : (
                <>
                  Iniciar sesión <ArrowRight aria-hidden="true" className="size-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4 text-sm text-muted" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
          </div>
          <p className="mx-auto mt-5 flex w-fit items-center gap-2.5 rounded-xl bg-surface px-6 py-3 text-sm text-muted">
            <ShieldCheck aria-hidden="true" className="size-5" strokeWidth={1.6} />
            Acceso seguro y protegido
          </p>
        </div>
      </main>
    </div>
  );
}
