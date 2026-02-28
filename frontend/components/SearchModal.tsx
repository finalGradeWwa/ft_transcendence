'use client';

/**
 * PL: Komponent kontenera modalu wyszukiwania. Obsługuje warstwę prezentacji (overlay),
 * interakcję z użytkownikiem, sortowanie, paginację oraz logikę dostępności (fokus i klawisz Escape).
 * EN: Search modal container component. Handles the presentation layer (overlay),
 * user interaction, sorting, pagination, and accessibility logic (focus and Escape key).
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Icon } from '@/components/icons/ui/Icon';
import { apiFetch } from '@/lib/auth';

// PL: Definicja typu użytkownika zgodna z PublicUserSerializer z backendu.
// EN: User type definition matching PublicUserSerializer from the backend.
interface SearchResult {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar_photo?: string;
}

interface SearchModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const RESULTS_PER_PAGE = 5;

/**
 * PL: Komponent zarządzający widocznością i interakcjami modalu wyszukiwania.
 * EN: Component managing the visibility and interactions of the search modal.
 */
const SearchModal = ({ isVisible, onClose }: SearchModalProps) => {
  const t = useTranslations('SearchModal');
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [visibleCount, setVisibleCount] = useState(RESULTS_PER_PAGE);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /**
   * PL: Posortowane wyniki wg nazwy użytkownika.
   * EN: Results sorted by username.
   */
  const sortedResults = useMemo(() => {
    const sorted = [...results].sort((a, b) =>
      a.username.localeCompare(b.username)
    );
    return sortAsc ? sorted : sorted.reverse();
  }, [results, sortAsc]);

  /** PL: Wyniki ograniczone do bieżącej strony. EN: Results limited to current page. */
  const visibleResults = sortedResults.slice(0, visibleCount);
  const hasMore = visibleCount < sortedResults.length;

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.trim() === '') {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await apiFetch(
          `/users/search/?search=${encodeURIComponent(searchQuery)}`
        );

        if (response.ok) {
          const data = await response.json();
          setResults(data);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  /** PL: Reset paginacji przy nowych wynikach. EN: Reset pagination on new results. */
  useEffect(() => {
    setVisibleCount(RESULTS_PER_PAGE);
  }, [results]);

  const handleResultClick = (result: SearchResult) => {
    onClose();
    router.push(`/profiles/${result.username}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  /**
   * PL: Efekt obsługujący fokusowanie pierwszego pola oraz nasłuchiwanie klawisza Escape.
   * EN: Effect handling focus on the first field and listening for Escape key.
   */
  useEffect(() => {
    if (!isVisible) return;

    searchInputRef.current?.focus();

    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isVisible, onClose]);

  /**
   * PL: Resetowanie pola i wyników po zamknięciu modalu.
   * EN: Resetting the field and results when the modal is closed.
   */
  useEffect(() => {
    if (!isVisible) {
      setSearchQuery('');
      setResults([]);
      setSortAsc(true);
      setVisibleCount(RESULTS_PER_PAGE);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <section
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md text-dark-text"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
      >
        <div className="bg-secondary-beige rounded-lg shadow-xl border border-black/10">
          {/** PL: Nagłówek modalu z tytułem i przyciskiem zamknięcia. EN: Modal header with title and close button. */}
          <header className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2
              id="search-modal-title"
              className="text-xl font-semibold text-dark-text"
            >
              {t('title')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-green"
              aria-label={t('aria.close')}
            >
              <Icon name="close" size={20} />
            </button>
          </header>

          {/** PL: Formularz wyszukiwania. EN: Search form. */}
          <form onSubmit={handleSubmit} className="p-4" role="search">
            <div className="relative">
              <input
                maxLength={100}
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('placeholder')}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon name="search" size={20} />
              </div>
            </div>
          </form>

          {/** PL: Pasek sortowania — widoczny gdy są wyniki. EN: Sort bar — visible when results exist. */}
          {searchQuery && results.length > 1 && (
            <div className="px-4 pb-2 flex items-center justify-between">
              <p className="text-sm text-dark-text/80">
                {t('resultsCount', { count: results.length })}
              </p>
              <button
                onClick={() => setSortAsc(prev => !prev)}
                className="text-xs font-bold text-primary-green px-2 py-1 rounded hover:bg-primary-green/10 transition-colors"
                aria-label={t('aria.sortOrder')}
              >
                {sortAsc ? t('sortAZ') : t('sortZA')}
              </button>
            </div>
          )}

          {/** PL: Kontener wyników z przewijaniem. EN: Scrollable results container. */}
          <nav className="max-h-96 overflow-y-auto">
            {/** PL: Wskaźnik ładowania. EN: Loading indicator. */}
            {isLoading && searchQuery && (
              <div className="px-4 pb-4 text-center text-gray-500">
                <div className="inline-block w-5 h-5 border-2 border-primary-green/30 border-t-primary-green rounded-full animate-spin mb-2" role="status" />
                <p className="text-sm">{t('loading')}</p>
              </div>
            )}

            {/** PL: Lista wyników wyszukiwania. EN: Search results list. */}
            {!isLoading && searchQuery && visibleResults.length > 0 && (
              <div className="px-4 pb-4">
                {results.length === 1 && (
                  <p className="text-sm text-dark-text/80 mb-2">
                    {t('resultsCount', { count: results.length })}
                  </p>
                )}

                <ul className="space-y-2">
                  {visibleResults.map(result => (
                    <li key={result.id}>
                      <button
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-green border border-transparent hover:border-primary-green/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0 border border-black/5">
                            {result.avatar_photo ? (
                              <img
                                src={result.avatar_photo}
                                alt={result.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary-green/10 text-primary-green text-xs font-bold uppercase">
                                {result.username.substring(0, 2)}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col">
                            <span className="text-gray-900 font-bold leading-none">
                              {result.username}
                            </span>
                            {(result.first_name || result.last_name) && (
                              <span className="text-xs text-gray-500 mt-1">
                                {result.first_name} {result.last_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>

                {/** PL: Przycisk "pokaż więcej" i informacja o liczbie. EN: "Show more" button and count info. */}
                {sortedResults.length > RESULTS_PER_PAGE && (
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-dark-text/60">
                      {t('showingOf', {
                        shown: visibleResults.length,
                        total: sortedResults.length,
                      })}
                    </span>
                    {hasMore && (
                      <button
                        onClick={() => setVisibleCount(prev => prev + RESULTS_PER_PAGE)}
                        className="font-bold text-primary-green hover:underline"
                      >
                        {t('showMore')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/** PL: Komunikat o braku wyników. EN: No results message. */}
            {!isLoading && searchQuery && results.length === 0 && (
              <div className="px-4 pb-4 text-center text-gray-500">
                <p>{t('noResults', { query: searchQuery })}</p>
              </div>
            )}
          </nav>
        </div>
      </section>
    </div>
  );
};

export default SearchModal;
