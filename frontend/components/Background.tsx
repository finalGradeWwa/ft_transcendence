/**
 * PL: Komponent tła aplikacji. Tworzy stałą strukturę wizualną z obrazem,
 * warstwą przyciemniającą oraz relatywnym kontenerem dla treści.
 * * EN: Application background component. Creates a fixed visual structure
 * with an image, a darkening layer, and a relative container for content.
 */

import Image from 'next/image';

export function Background({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-dark-bg">
      {/**
       * PL: Stała warstwa obrazu tła pokrywająca całe okno.
       * EN: Fixed background image layer covering the entire window.
       */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/background/background_image.webp"
          alt="" // Puste alt, bo to obrazek dekoracyjny
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/**
       * PL: Nakładka przyciemniająca tło.
       * EN: Background darkening overlay.
       */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-10"
        aria-hidden="true"
      />

      {/**
       * PL: Kontener pozycjonujący treść nad tłem.
       * EN: Container positioning content above the background.
       */}
      <div className="relative text-white z-20 flex-grow flex flex-col">
        {children}
      </div>
    </div>
  );
}
