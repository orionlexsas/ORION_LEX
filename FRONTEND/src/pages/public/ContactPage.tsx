import { ContactForm } from '@/features/contact';

export function ContactPage() {
  return (
    <section className="mx-auto max-w-xl px-4 py-16">
      <h1 className="mb-8 font-serif text-4xl">Contacto</h1>
      <ContactForm />
    </section>
  );
}
