/**
 * PL: Strona 404 (Server Component) wyświetlana, gdy żądana ścieżka nie istnieje.
 * Obsługuje tłumaczenia i18n w kontekście danego locale.
 * EN: 404 page (Server Component) displayed when the requested path does not exist.
 * Supports i18n translations within the given locale context.
 */

import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function NotFound() {
	let t: Awaited<ReturnType<typeof getTranslations>>;

	try {
		t = await getTranslations('NotFoundPage');
	} catch {
		// PL: Fallback gdy locale nie jest dostępny (np. globalny not-found).
		// EN: Fallback when locale is not available (e.g., global not-found).
		return (
			<div className="flex flex-col items-center justify-center flex-grow py-20 text-center">
				<h1 className="text-6xl font-bold text-header-main mb-4">404</h1>
				<p className="text-xl text-white mb-8">Page not found</p>
				<Link
					href="/"
					className="inline-block bg-primary-green text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity duration-300"
				>
					Back to home
				</Link>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center flex-grow py-20 text-center">
			<h1 className="text-6xl font-bold text-header-main mb-4">404</h1>
			<p className="text-xl text-white mb-8">{t('description')}</p>
			<Link
				href="/"
				className="inline-block bg-primary-green text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity duration-300"
			>
				{t('backHome')}
			</Link>
		</div>
	);
}
