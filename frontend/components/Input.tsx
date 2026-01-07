/**
 * PL: Uniwersalny komponent pola tekstowego (Input) z obsługą dostępności (A11y).
 * Wykorzystuje forwardRef dla integracji z bibliotekami formularzy oraz zapewnia
 * spójną stylistykę wspierającą kierunki tekstu LTR/RTL.
 * * EN: Universal text input component with accessibility (A11y) support.
 * Utilizes forwardRef for form library integration and provides consistent
 * styling supporting both LTR/RTL text directions.
 */

import React, { forwardRef, InputHTMLAttributes } from 'react';

/**
 * PL: Interfejs definiujący właściwości komponentu Input, rozszerzający standardowe atrybuty HTML.
 * EN: Interface defining Input component props, extending standard HTML attributes.
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id?: string; // Dodaj ten znak zapytania
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, id, placeholder, type = 'text', required = false, ...props },
    ref
  ) => {
    return (
      <div className="flex flex-col space-y-1">
        {/**
         * PL: Etykieta pola z opcjonalnym wskaźnikiem wymagalności.
         * EN: Field label with an optional requirement indicator.
         */}
        <label htmlFor={id} className="text-sm font-medium text-neutral-900">
          {label}
          {required && (
            <span className="text-red-600 ms-1" aria-hidden="true">
              *
            </span>
          )}
        </label>

        {/**
         * PL: Element wejściowy z obsługą referencji i stylami logicznymi dla RTL.
         * EN: Input element with reference support and logical styles for RTL.
         */}
        <input
          id={id}
          ref={ref}
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
            ps-3
          "
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
