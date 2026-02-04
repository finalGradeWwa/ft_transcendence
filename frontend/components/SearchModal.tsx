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

  const [searchQuery, setSearchQuery] = useState('');

  // State storing search results (mock data).
  const [results, setResults] = useState<string[]>([]);

  // Ref to input field for autofocus.
  const searchInputRef = useRef<HTMLInputElement>(null);

  /**
   * TODO: Replace mock data with actual API call.
   */
  useEffect(() => {
	if (searchQuery.trim() === '') {
	  setResults([]);
	  return;
	}


	//  Example mock results - to be replaced by API call
	const mockResults = [
	  'User',
	  'Profile',
	  'Settings',
	  'Messages',
	  'Notifications',
	].filter(item =>
	  item.toLowerCase().includes(searchQuery.toLowerCase())
	);

	setResults(mockResults);
  }, [searchQuery]);

  //--------------
  /** TODO: Add search logic, API calls, sending form submission */

  const handleResultClick = (result: string) => {
	console.log('Selected:', result);
	onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
	e.preventDefault();
  };
  //---------------

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
	  <div
		/** PL: Zatrzymanie bąbelkowania zdarzenia, aby kliknięcie wewnątrz modalu go nie zamykało.
			EN: Stopping event bubbling so clicking inside the modal doesn't close it. */
		onClick={e => e.stopPropagation()}
		className="w-full max-w-md"
	  >
		<div className="bg-white rounded-lg shadow-xl">

		  {/** Modal header with title and close button. */}
		  <div className="flex items-center justify-between p-4 border-b border-gray-200">
			<h2
			  id="search-modal-title"
			  className="text-xl font-semibold text-gray-900"
			>
			  {t('title')}
			</h2>
			<button
			  onClick={onClose}
			  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
			  aria-label={t('aria.close')}
			>
			  <Icon name="close" size={20} />
			</button>
		  </div>

		  {/** Search form with input field and icon. */}
		  <form onSubmit={handleSubmit} className="p-4">
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
		  <div className="max-h-96 overflow-y-auto">

			{/** Display search results list. */}
			{searchQuery && results.length > 0 && (
			  <div className="px-4 pb-4">
				<p className="text-sm text-gray-500 mb-2">
				  {t('resultsCount', { count: results.length })}
				</p>

				{/** Mapping results to clickable list items. */}
				<ul className="space-y-2">
				  {results.map((result) => (
					<li key={result}>
					  <button
						onClick={() => handleResultClick(result)}
						className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-green"
					  >
						<div className="flex items-center gap-3">
						  <Icon name="search" size={16} className="text-gray-400" />
						  <span className="text-gray-900">{result}</span>
						</div>
					  </button>
					</li>
				  ))}
				</ul>
			  </div>
			)}

			{/** No results message. */}
			{searchQuery && results.length === 0 && (
			  <div className="px-4 pb-4 text-center text-gray-500">
				<p>{t('noResults', { query: searchQuery })}</p>
			  </div>
			)}
		  </div>
		</div>
	  </div>
	</div>
  );
};

export default SearchModal;