import { Outlet } from 'react-router';

/** Estructura del panel de administración. Aquí irá el menú lateral y la protección por sesión. */
export function AdminLayout() {
  return (
    <div className="flex min-h-dvh">
      <aside className="w-60 border-r border-border bg-surface p-4 font-serif">
        Orion Lex · Admin
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
