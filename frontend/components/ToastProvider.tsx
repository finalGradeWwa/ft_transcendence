'use client';

/**
 * PL: Globalny system powiadomień toast. Zapewnia kontekst do wyświetlania
 * krótkich komunikatów o sukcesie, błędzie lub informacji.
 * EN: Global toast notification system. Provides context for displaying
 * short success, error, or info messages.
 */

import { createContext, useContext, useState, useCallback, useRef } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
	id: number;
	message: string;
	type: ToastType;
}

interface ToastContextValue {
	showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * PL: Hook do wyświetlania toastów z dowolnego komponentu klienckiego.
 * EN: Hook to display toasts from any client component.
 */
export function useToast(): ToastContextValue {
	const ctx = useContext(ToastContext);
	if (!ctx) {
		throw new Error('useToast must be used within <ToastProvider>');
	}
	return ctx;
}

const TOAST_DURATION = 4000;

/**
 * PL: Komponent pojedynczego toastu z animacją wejścia/wyjścia.
 * EN: Single toast component with enter/exit animation.
 */
const ToastItem = ({
	toast,
	onRemove,
}: {
	toast: Toast;
	onRemove: (id: number) => void;
}) => {
	const bgColor = {
		success: 'bg-primary-green text-white',
		error: 'bg-red-700 text-white',
		info: 'bg-header-main text-white',
	}[toast.type];

	const icon = {
		success: '✓',
		error: '✕',
		info: 'ℹ',
	}[toast.type];

	return (
		<div
			role="status"
			aria-live="polite"
			className={`${bgColor} px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 min-w-[280px] max-w-md animate-[slideIn_0.3s_ease-out] text-sm font-semibold`}
		>
			<span className="text-lg flex-shrink-0" aria-hidden="true">
				{icon}
			</span>
			<span className="flex-grow">{toast.message}</span>
			<button
				onClick={() => onRemove(toast.id)}
				className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity text-lg leading-none"
				aria-label="Close"
			>
				×
			</button>
		</div>
	);
};

/**
 * PL: Provider toastów — renderuje kontener z animowanymi powiadomieniami.
 * EN: Toast provider — renders container with animated notifications.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);
	const idRef = useRef(0);

	const removeToast = useCallback((id: number) => {
		setToasts(prev => prev.filter(t => t.id !== id));
	}, []);

	const showToast = useCallback(
		(message: string, type: ToastType = 'success') => {
			const id = ++idRef.current;
			setToasts(prev => [...prev, { id, message, type }]);

			setTimeout(() => {
				removeToast(id);
			}, TOAST_DURATION);
		},
		[removeToast]
	);

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}

			{/* PL: Kontener toastów — fixed w prawym dolnym rogu. EN: Toast container — fixed at bottom-right. */}
			{toasts.length > 0 && (
				<div
					className="fixed bottom-6 end-6 z-[9999] flex flex-col gap-3 pointer-events-auto"
					aria-label="Notifications"
				>
					{toasts.map(toast => (
						<ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
					))}
				</div>
			)}
		</ToastContext.Provider>
	);
}
