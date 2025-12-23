// /components/Input.tsx

import React, { forwardRef, InputHTMLAttributes } from 'react';

// rozszerzenie standardowych atrybutow input i dodanie wlasnych
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string; // wymagana etykieta dla dostepnosci
  id: string; // Wymagane ID do powiazania etykiety z polem
}

// używamy forwardRef, aby przekazać ref do elementu DOM
// TypeScript automatycznie inferuje poprawny typ dla ref
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, id, placeholder, type = 'text', required = false, ...props },
    ref
  ) => {
    return (
      <div className="flex flex-col space-y-1">
        <label htmlFor={id} className="text-sm font-medium text-neutral-900">
          {label}
          {required && (
            <span className="text-red-600 ms-1" aria-hidden="true">
              *
            </span>
          )}
        </label>

        <input
          id={id}
          ref={ref} // przekazujemy ref do elementu input
          type={type}
          placeholder={placeholder}
          required={required}
          aria-required={required}
          className="
            p-2 
            border border-border-gray 
            rounded-md 
            bg-light-bg 
            text-dark-text 
            text-start 
            focus:outline-none 
            focus:ring-2 
            focus:ring-primary-green
            focus:border-transparent 
            border-s-4 
            border-secondary-beige
            ps-3 // Padding Start
          "
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input'; // dobra praktyka w React przy forwardRef

export default Input;
