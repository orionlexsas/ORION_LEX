import type { ReactNode } from 'react';
import { labelClass } from './styles';

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  /** true si el control tiene botones dentro: se agrupa sin <label> (lleva su propio aria-label). */
  group?: boolean;
  children: ReactNode;
}

/** Campo de formulario del panel: etiqueta, control y, debajo, el error o una ayuda. */
export function Field({ label, required, error, hint, group, children }: FieldProps) {
  const Wrapper = group ? 'div' : 'label';
  return (
    <div>
      <Wrapper className="block">
        <span className={labelClass}>
          {label}
          {required && <span className="text-danger"> *</span>}
        </span>
        {children}
      </Wrapper>
      {error ? (
        <p role="alert" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-right text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}
