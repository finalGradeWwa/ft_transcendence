'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { HomePageClient } from '../../../../HomePageClient';
import { GardenActions } from '@/components/gardens/GardenActions';
import { apiFetch } from '@/lib/auth';

interface GardenDetailClientProps {
	gardenId: string;
	username: string;
}

export const GardenDetailClient = ({ gardenId, username }: GardenDetailClientProps) => {
	const tGardens = useTranslations('GardensPage');

	const [garden, setGarden] = useState<any>(null);
	const [plantsData, setPlantsData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				const [gardenRes, plantsRes] = await Promise.all([
					apiFetch(`/api/garden/${gardenId}/`, { skipRedirect: true }),
					apiFetch(`/api/plant/?garden=${encodeURIComponent(gardenId)}`, { skipRedirect: true })
				]);

				if (!gardenRes.ok) {
					if (!cancelled) setLoading(false);
					return;
				}

				const g = await gardenRes.json();
				const p = plantsRes.ok ? await plantsRes.json() : [];

				if (!cancelled) {
					setGarden(g);
					setPlantsData(Array.isArray(p) ? p : []);
					setLoading(false);
				}
			} catch {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => { cancelled = true; };
	}, [gardenId]);

	if (loading) {
		return (
			<div className="min-h-screen bg-main-gradient pt-32 pb-20 flex items-start justify-center">
				<div className="text-white-text flex mt-32 font-bold text-sm uppercase tracking-widest animate-pulse">
					Loading...
				</div>
			</div>
		);
	}

	if (!garden) {
		return null;
	}

	const isDefault = garden.name?.includes("'s Garden") || garden.name === 'Default Garden';
	const gardenDisplayName = isDefault ? tGardens('defaultGardenName') : garden.name || gardenId;

	const envMap: Record<string, string> = {
		i: 'indoor',
		o: 'outdoor',
		g: 'greenhouse',
	};
	const envKey = envMap[garden.environment?.toLowerCase() || ''];

	const plants = plantsData.map((p: any) => {
		let finalImage = '/images/garden/garden-placeholder.webp';
		const rawImage = p.image_url || p.image || p.thumbnail;

		if (rawImage) {
			if (rawImage.startsWith('http')) {
				try {
					const u = new URL(rawImage);
					finalImage = u.pathname.startsWith('/media/') ? u.pathname : rawImage;
				} catch {
					finalImage = rawImage;
				}
			} else {
				finalImage = rawImage.startsWith('/') ? rawImage : `/${rawImage}`;
			}
		}

		return {
			id: p.plant_id,
			commonName: p.nickname,
			latinName: p.species || '',
			author: p.owner_username || p.owner || username,
			garden: gardenDisplayName,
			gardenId: parseInt(gardenId),
			image: finalImage,
		};
	});

	return (
		<div className="min-h-screen bg-main-gradient pb-20 overflow-hidden">
			<header className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 pt-12 pb-4">
				<div className="bg-gradient-to-r from-secondary-beige/90 via-secondary-beige/80 to-header-main/60 p-6 sm:p-8 md:p-10 rounded-2xl border-b-4 border-primary-green/20 shadow-xl relative overflow-hidden mx-4 sm:mx-0 outline outline-2 outline-neutral-900 outline-offset-2">
					<h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter">
						<span className="text-primary-green uppercase mr-4">
							{garden.owner_username || garden.owner || username}
						</span>
						<span className="text-primary-green/30 font-light mr-4">—</span>
						<span className="text-neutral-800 uppercase">
							{gardenDisplayName}
						</span>
					</h1>
					<div className="h-2 w-24 bg-primary-green mt-6 rounded-full" />
					{envKey && (
						<p className="text-neutral-600 mt-4 font-bold uppercase tracking-[0.3em] text-xs">
							{tGardens(`environments.${envKey}` as any)}
						</p>
					)}
				</div>
			</header>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
				<GardenActions
					gardenId={gardenId}
					username={username}
					isDefault={isDefault}
					members={garden.members || []}
					owner={garden.owner || ''}
					tAddPlant={tGardens('addPlant')}
					tAddGardener={tGardens('addGardener')}
					tManageGarden={tGardens('manageGarden')}
				/>
			</div>

			<div className="overflow-hidden px-0 sm:px-4">
				<HomePageClient plants={plants} hideTitle />
			</div>
		</div>
	);
};
