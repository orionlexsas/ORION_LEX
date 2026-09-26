import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/cn';

/** Botón para alternar entre tema claro y oscuro. */
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? t('theme.toLight') : t('theme.toDark');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        'relative grid size-11 cursor-pointer place-items-center rounded-full border border-accent text-foreground/85 transition-colors hover:bg-accent/10 hover:text-accent-text active:bg-accent/20',
        className,
      )}
    >
      {/* Los dos íconos se cruzan con un giro suave al cambiar */}
      <Sun
        aria-hidden="true"
        className={cn(
          'absolute size-5 transition-all duration-500 ease-out-soft',
          isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-90 opacity-0',
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          'absolute size-5 transition-all duration-500 ease-out-soft',
          isDark ? 'scale-50 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100',
        )}
      />
    </button>
  );
}
