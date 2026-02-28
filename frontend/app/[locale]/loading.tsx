/**
 * PL: Komponent ładowania (Suspense boundary) wyświetlany podczas nawigacji między stronami.
 * Aktywuje Next.js Streaming SSR — treść jest progresywnie przesyłana do przeglądarki.
 * EN: Loading component (Suspense boundary) displayed during page navigation.
 * Activates Next.js Streaming SSR — content is progressively streamed to the browser.
 */

export default function Loading() {
  return (
    <div
      className="flex flex-col items-center justify-center flex-grow py-20"
      role="status"
      aria-label="Loading"
    >
      <div className="w-12 h-12 border-4 border-primary-green border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
