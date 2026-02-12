'use client';

/**
 * PL: Komponent kontenera modalu wyszukiwania. Obsługuje warstwę prezentacji (overlay),
 * interakcję z użytkownikiem oraz logikę dostępności (fokus i klawisz Escape).
 * EN: Search modal container component. Handles the presentation layer (overlay),
 * user interaction, and accessibility logic (focus and Escape key).
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/icons/ui/Icon';
import { useDebounce } from '@/hooks/useDebounce';
import { getApiUrl, apiFetch } from '@/lib/auth';
interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

interface SearchModalProps {
  isVisible: boolean;
  onClose: () => void;
}

/**
 * PL: Komponent zarządzający widocznością i interakcjami modalu wyszukiwania.
 * EN: Component managing the visibility and interactions of the search modal.
 */
const SearchModal = ({ isVisible, onClose }: SearchModalProps) => {
  const t = useTranslations('SearchModal');

  const apiUrl = getApiUrl();

  const [searchQuery, setSearchQuery] = useState('');

  // Debounced search value (waits 500ms).
  const debouncedQuery = useDebounce(searchQuery, 500)

  // State storing search results (now User objects, not strings).
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Ref to input field for autofocus.
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async () => {
      const q = debouncedQuery.trim();
      if (!q) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Request to Django backend.
        const encoded = encodeURIComponent(q);

        const response = await apiFetch(`/users/search/?search=${encoded}`, {
          method: 'GET',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Network response was not ok (${response.status})`);
        }

        const data = (await response.json()) as User[];
        setResults(data);
      } catch (error) {
        if ((error as any)?.name !== 'AbortError') {
          console.error('Search error:', error);
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();
    return () => controller.abort();
  }, [debouncedQuery, apiUrl]);

  const handleResultClick = (user: User) => {
    console.log('Selected user:', user);
    // Here add example: router.push(`/profiles/${username}`)
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (!isVisible) {
      setSearchQuery('');
      setResults([]);
    }
  }, [isVisible]);

  /**
   * PL: Efekt obsługujący fokusowanie pierwszego pola oraz nasłuchiwanie klawisza Escape.
   * EN: Effect handling focus on the first field and listening for Escape key.
   */
  useEffect(() => {
    if (!isVisible) return;

    // PL: Ustawienie fokusu na searchbar dla lepszego UX. EN: Setting focus on searchbar for better UX.
    searchInputRef.current?.focus();

    /** PL: Funkcja zamykająca modal po naciśnięciu ESC. EN: Function closing the modal on ESC press. */
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();

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
      <section
        /** PL: Zatrzymanie bąbelkowania zdarzenia, aby kliknięcie wewnątrz modalu go nie zamykało.
            EN: Stopping event bubbling so clicking inside the modal doesn't close it. */
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md text-dark-text"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
      >
        <div className="bg-secondary-beige rounded-lg shadow-xl border border-black/10">
          {/** Modal header with title and close button. */}
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

          {/** Search form with input field and icon. */}
          <form onSubmit={handleSubmit} className="p-4" role="search">
            <div className="relative">
              <input
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

          {/** Scrollable results container - displays results, no results, or initial prompt. */}
          <nav className="max-h-96 overflow-y-auto">
            {loading && debouncedQuery.trim() && (
              <div className="px-4 pb-4 text-center text-gray-500">
                <p>{t('loading')}</p>
              </div>
            )}
            {/** Display search results list. */}
            {debouncedQuery.trim() && results.length > 0 && (
              <div className="px-4 pb-4">
                <p className="text-sm text-dark-text/80 mb-2">
                  {t('resultsCount', { count: results.length })}
                </p>

                {/** Mapping results to clickable list items. */}
                <ul className="space-y-2">
                  {results.map(user => (
                    <li key={user.id}>
                      <button
                        onClick={() => handleResultClick(user)}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-green"
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            name="search"
                            size={16}
                            className="text-dark-text"
                          />
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{user.username}</span>
                            {/* Displays firstNames and lastNames if exists */}
                            {(user.first_name || user.last_name) && (
                              <span className="text-xs text-gray-500">
                                {user.first_name} {user.last_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/** No results message. */}
            {debouncedQuery.trim() && !loading && results.length === 0 && (
              <div className="px-4 pb-4 text-center text-gray-500">
                <p>{t('noResults', { query: debouncedQuery.trim() })}</p>
              </div>
            )}
          </nav>
        </div>
      </section>
    </div>
  );
};

export default SearchModal;
