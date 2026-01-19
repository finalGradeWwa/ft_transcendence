'use client';

import React from 'react';

/**
 * PL: Typy wariantów typograficznych dostępnych w systemie projektowym.
 * EN: Typographic variant types available in the design system.
 */
type TextVariant = 'body' | 'small' | 'caption' | 'muted';

/**
 * PL: Interfejs właściwości dla komponentu Text, pozwalający na polimorfizm tagów HTML.
 * EN: Props interface for the Text component, allowing HTML tag polymorphism.
 */
interface TextProps {
  /** PL: Styl wizualny tekstu. EN: Visual style of the text. */
  variant?: TextVariant;
  /** PL: Znacznik HTML, który zostanie wyrenderowany. EN: The HTML tag to be rendered. */
  as?: 'p' | 'span' | 'div';
  /** PL: Dodatkowe klasy CSS (Tailwind). EN: Additional CSS classes (Tailwind). */
  className?: string;
  /** PL: Treść tekstowa lub elementy potomne. EN: Text content or child elements. */
  children: React.ReactNode;
  /** PL: Unikalny identyfikator elementu. EN: Unique identifier for the element. */
  id?: string;
}

/**
 * PL: Reużywalny komponent typograficzny służący do zachowania spójności tekstów w całej aplikacji.
 * EN: Reusable typography component used to maintain text consistency throughout the application.
 */
export const Text = ({
  variant = 'body',
  as: Component = 'p',
  className = '',
  children,
  id,
}: TextProps) => {
  /**
   * PL: Mapa stylów przypisana do konkretnych wariantów projektowych.
   * EN: Style map assigned to specific design variants.
   */
  const styles: Record<TextVariant, string> = {
    body: 'text-base text-neutral-900',
    small: 'text-sm text-neutral-800',
    caption: 'text-xs text-neutral-600',
    muted: 'text-sm text-neutral-500',
  };

  return (
    <Component id={id} className={`${styles[variant]} ${className}`.trim()}>
      {children}
    </Component>
  );
};
