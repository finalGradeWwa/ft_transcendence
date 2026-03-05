'use client';

import { useState, useEffect } from 'react';
import UserProfileClient from '../UserProfileClient';
import { apiFetch } from '@/lib/auth';

interface ProfilePageClientProps {
	username: string;
}

export default function ProfilePageClient({ username }: ProfilePageClientProps) {
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				const [profileRes, gardensRes] = await Promise.all([
					apiFetch(`/users/profile/${encodeURIComponent(username)}/`, { skipRedirect: true }),
					apiFetch(`/api/garden/?member=${encodeURIComponent(username)}`, { skipRedirect: true }),
				]);

				if (!profileRes.ok) {
					if (!cancelled) setLoading(false);
					return;
				}

				const userData = await profileRes.json();
				const allGardens = gardensRes.ok ? await gardensRes.json() : [];

				if (Array.isArray(allGardens)) {
					userData.owned_gardens = allGardens.filter(
						(g: any) => g.owner === username
					);
					userData.joined_gardens = allGardens.filter(
						(g: any) => g.owner !== username && g.user_count > 1
					);
					userData.gardens_count = userData.owned_gardens.length;
				}

				userData.pins = [];

				if (!cancelled) {
					setUser(userData);
					setLoading(false);
				}
			} catch {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => { cancelled = true; };
	}, [username]);

	if (loading) {
		return (
			<div className="min-h-screen bg-main-gradient flex items-center justify-center">
				<div className="text-white-text font-bold text-sm uppercase tracking-widest animate-pulse">
					Loading...
				</div>
			</div>
		);
	}

	if (!user) return null;

	return <UserProfileClient user={user} currentLoggedUser={null} />;
}
