import { useRouteError } from 'react-router';
import { RotateCw } from 'lucide-react';

/**
 * Pantalla amable cuando una página falla (en lugar del aviso técnico en inglés de React Router).
 * Solo en español y sin traducciones: puede salir en la web o en el panel.
 */
export function RouteError() {
  const error = useRouteError();
  // Queda en la consola para poder revisarlo.
  console.error(error);

  return (
    <main
      translate="no"
      className="grid min-h-dvh place-items-center bg-background px-6 text-center text-foreground"
    >
      <div className="max-w-sm">
        <h1 className="font-serif text-3xl font-semibold">Algo no cargó bien</h1>
        <p className="mt-3 text-muted">
          Vuelva a cargar la página. Si tiene el traductor del navegador activado, desactívelo para
          esta página: el sitio ya está en español.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md bg-accent px-6 font-semibold text-on-accent"
          >
            <RotateCw className="size-4" aria-hidden="true" />
            Recargar
          </button>
          <a href="/" className="text-sm text-muted underline underline-offset-4">
            Ir al inicio
          </a>
        </div>
      </div>
    </main>
  );
}
