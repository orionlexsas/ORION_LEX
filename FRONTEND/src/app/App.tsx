import { RouterProvider } from 'react-router';
import { IntroCurtain } from '@/components/layout/IntroCurtain';
import { useContent } from '@/content';
import { Providers } from './providers';
import { router } from './router';

export function App() {
  return (
    <Providers>
      <Intro />
      <RouterProvider router={router} />
    </Providers>
  );
}

/** Video de intro configurado en el contenido (site.intro). */
function Intro() {
  const { site } = useContent();
  return <IntroCurtain src={site.intro?.video} />;
}
