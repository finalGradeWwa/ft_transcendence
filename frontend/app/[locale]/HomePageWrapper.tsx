'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { RtlWrapper } from '@/components/RtlWrapper';
import { PlantType } from '../types/plantTypes';
import { LandingPage } from './LandingPage';
import { setAccessToken, apiFetch } from '@/lib/auth';

function mapPlant(p: any): PlantType {
	return {
		id: p.plant_id,
		author: p.owner_username,
		latinName: p.species,
		commonName: p.nickname,
		averageRating: '0.0',
		totalReviews: 0,
		image: p.image_url,
		garden: p.garden_name,
		gardenId: p.garden_id,
	};
}

export default function HomePageWrapper() {
	const locale = useLocale();
	const searchParams = useSearchParams();
	const showLogin = searchParams.get('showLogin') === 'true';
	const registered = searchParams.get('registered') === 'true';

	const [state, setState] = useState<'loading' | 'guest' | 'auth'>('loading');
	const [plants, setPlants] = useState<PlantType[]>([]);

	useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				// Soft session check — no redirects on failure
				const refreshRes = await fetch('/api/auth/token/refresh/', {
					method: 'POST',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' },
				});

				if (!refreshRes.ok) {
					if (!cancelled) setState('guest');
					return;
				}

				const refreshData = await refreshRes.json();
				if (refreshData?.access) {
					setAccessToken(refreshData.access);
				}

				// Fetch plants
				const plantsRes = await apiFetch('/api/plant/', { skipRedirect: true });
				const plantsData = plantsRes.ok ? await plantsRes.json() : [];

				if (!cancelled) {
					setPlants(Array.isArray(plantsData) ? plantsData.map(mapPlant) : []);
					setState('auth');
				}
			} catch {
				if (!cancelled) setState('guest');
			}
		})();

		return () => { cancelled = true; };
	}, []);

	if (state === 'loading') {
		return (
			<div className="min-h-screen bg-main-gradient flex items-center justify-center">
				<div className="text-white-text font-bold text-sm uppercase tracking-widest animate-pulse">
					Loading...
				</div>
			</div>
		);
	}

	if (state === 'guest') {
		return <LandingPage locale={locale} showLogin={showLogin} />;
	}

	return (
		<RtlWrapper
			plants={plants}
			locale={locale}
			showLogin={showLogin}
			isRegistered={registered}
		/>
	);
}
