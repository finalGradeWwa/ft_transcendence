'use client';

/**
 * PL: Komponent kontenera modalu logowania. Obsługuje warstwę prezentacji (overlay),
 * blokowanie tła oraz logikę dostępności (fokus i klawisz Escape).
 * EN: Login modal container component. Handles the presentation layer (overlay),
 * background blocking, and accessibility logic (focus and Escape key).
 */

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ModalContent } from './ModalContent';

/**
 * PL: Komponent zarządzający widocznością i interakcjami modalu logowania.
 * EN: Component managing the visibility and interactions of the login modal.
 */
const LoginModal = ({ isVisible, onClose, t }: any) => {
  /** PL: Referencja do pola input dla automatycznego ustawienia fokusu. EN: Ref to input field for autofocus. */
  const usernameInputRef = useRef<HTMLInputElement>(null);

  /** PL: Hook do pobierania tłumaczeń błędów. EN: Hook for fetching error translations. */
  const tError = useTranslations();

  /**
   * PL: Efekt obsługujący fokusowanie pierwszego pola oraz nasłuchiwanie klawisza Escape.
   * EN: Effect handling autofocus on the first field and listening for the Escape key.
   */
  useEffect(() => {
    if (!isVisible) return;

    // PL: Ustawienie fokusu na loginie dla lepszego UX. EN: Setting focus on login for better UX.
    usernameInputRef.current?.focus();

    /** PL: Funkcja zamykająca modal po naciśnięciu ESC. EN: Function closing the modal on ESC press. */
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      /** PL: Półprzezroczyste tło z efektem rozmycia. EN: Semi-transparent background with blur effect. */
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        /** PL: Zatrzymanie bąbelkowania zdarzenia, aby kliknięcie wewnątrz modalu go nie zamykało. 
            EN: Stopping event bubbling so clicking inside the modal doesn't close it. */
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <ModalContent
          t={t}
          tError={tError}
          onClose={onClose}
          usernameRef={usernameInputRef}
        />
      </div>
    </div>
  );
};

export default LoginModal;
