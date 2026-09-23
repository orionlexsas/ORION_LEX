import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">Página no encontrada</h1>
      <Link to="/" className="mt-6 inline-block underline">
        Volver al inicio
      </Link>
    </section>
  );
}
