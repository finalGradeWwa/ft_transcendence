/**
 * PL: Komponent tła aplikacji. Tworzy stałą strukturę wizualną z obrazem, 
 * warstwą przyciemniającą oraz relatywnym kontenerem dla treści.
 * * EN: Application background component. Creates a fixed visual structure 
 * with an image, a darkening layer, and a relative container for content.
 */
export function Background({ children }) {
  return (
    <div className="relative">
      {/**
       * PL: Stała warstwa obrazu tła pokrywająca całe okno.
       * EN: Fixed background image layer covering the entire window.
       */}
      <div 
        className="fixed inset-0 opacity-80"
        style={{ 
          backgroundImage: "url('/images/background/background_image.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/**
       * PL: Nakładka przyciemniająca tło.
       * EN: Background darkening overlay.
       */}
      <div className="fixed inset-0 bg-black/40" />

      {/**
       * PL: Kontener pozycjonujący treść nad tłem.
       * EN: Container positioning content above the background.
       */}
      <div className="relative text-white">
        {children}
      </div>
    </div>
  );
}