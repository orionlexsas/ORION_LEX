import type { BlogContent } from '@orion-lex/shared';
import { Container } from '@/components/ui/Container';

// La foto se desvanece hacia la izquierda, sin borde visible.
const fadeLeft = { maskImage: 'linear-gradient(to right, transparent, #000 55%)' };

/** Encabezado de /actualidad: título a la izquierda y la foto de la balanza fundida por la derecha. */
export function BlogHero({ blog }: { blog: BlogContent }) {
  return (
    <section aria-labelledby="blog-title" className="relative isolate overflow-hidden">
      <img
        src={blog.heroImage.src}
        alt={blog.heroImage.alt}
        fetchPriority="high"
        style={fadeLeft}
        className="absolute inset-y-0 right-0 -z-10 h-full w-full object-cover object-right opacity-35 sm:w-[75%] sm:opacity-100 lg:w-[62%]"
      />
      <Container className="py-14 lg:py-20">
        <p className="eyebrow">{blog.eyebrow}</p>
        <h1
          id="blog-title"
          className="mt-4 font-serif text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-[4rem]"
        >
          {blog.title}
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/80 lg:text-xl">
          {blog.description}
        </p>
      </Container>
    </section>
  );
}
