'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/auth';
import { Link, useRouter } from '@/i18n/navigation';
import { buildImageUrl } from '@/lib/imageUrl';

/**
 * PL: Strona dodawania pinu (notatki) do istniejącej rośliny lub ogrodu.
 * EN: Page for adding a pin (note) to an existing plant or garden.
 */
export default function AddPinPage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { username } = use(params);
  const t = useTranslations('AddPinPage');
  const router = useRouter();

  /**
   * PL: Stany zarządzające typem pinu, listą obiektów, wybranym ID oraz opisem.
   * EN: States managing pin type, list of items, selected ID, and description.
   */
  const [pinType, setPinType] = useState<'plant' | 'garden'>('plant');
  const [items, setItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ description?: string; item?: string }>(
    {}
  );

  /**
   * PL: Pobieranie danych z API w zależności od wybranego typu (Roślina/Ogród).
   * EN: Fetching data from API depending on the selected type (Plant/Garden).
   */
  useEffect(() => {
    const endpoint =
      pinType === 'plant'
        ? `/api/plant/?username=${username}`
        : `/api/garden/?username=${username}`;

    apiFetch(endpoint)
      .then(res => res.json())
      .then(data => {
        const itemsList = Array.isArray(data) ? data : data.results || [];
        setItems(itemsList);

        if (itemsList.length > 0) {
          const firstId =
            itemsList[0].plant_id || itemsList[0].garden_id || itemsList[0].id;
          setSelectedItemId(firstId ? firstId.toString() : '');
        } else {
          setSelectedItemId('');
        }
      })
      .catch(() => {
        setItems([]);
      });
  }, [pinType, username]);

  const selectedItem = items.find(item => {
    const itemId = item.plant_id || item.garden_id || item.id;
    return itemId?.toString() === selectedItemId;
  });

  /**
   * PL: Obsługa wysyłania formularza do backendu.
   * EN: Handling form submission to the backend.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { description?: string; item?: string } = {};
    if (!selectedItemId) newErrors.item = t('errors.selectItem');
    if (!description.trim()) newErrors.description = t('errors.addDescription');
    if (description.trim().length > 150)
      newErrors.description = t('errors.tooLong');
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const payload: any = {
      content: description,
    };

    if (pinType === 'plant') {
      payload.plant = parseInt(selectedItemId, 10);
    } else {
      payload.garden = parseInt(selectedItemId, 10);
    }

    try {
      const res = await apiFetch('/api/pins/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push(`/profiles/${username}`);
        router.refresh();
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-main-gradient min-h-screen pb-20 pt-12 px-4">
      <div className="max-w-xl mx-auto bg-secondary-beige rounded-3xl shadow-2xl p-8 border border-primary-green/10">
        {/** PL: Przycisk powrotu EN: Back button */}
        <Link
          href={`/profiles/${username}`}
          className="text-primary-green font-bold text-xs uppercase mb-6 flex rounded-md items-center gap-2 hover:opacity-70 transition-opacity w-fit focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-green"
        >
          <span>←</span> {t('back')}
        </Link>

        <h1 className="text-3xl font-black text-dark-text uppercase tracking-tighter mb-8">
          {t('title')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/** PL: Przełącznik typu zasobu (Roślina vs Ogród) EN: Resource type toggle (Plant vs Garden) */}
          <div className="flex gap-2 p-1 bg-black/5 rounded-2xl">
            {(['plant', 'garden'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setPinType(type)}
                className={`flex-1 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-green ${
                  pinType === type
                    ? 'bg-primary-green text-white shadow-md'
                    : 'bg-container-light-2 border border-gray-green-text/50 text-dark-text hover:bg-black/5'
                }`}
              >
                {type === 'plant' ? t('typePlant') : t('typeGarden')}
              </button>
            ))}
          </div>

          {/** PL: Wybór konkretnego elementu z listy oraz podgląd graficzny EN: Selection of a specific item and visual preview */}
          <div className="space-y-4">
            <label className="text-[14px] font-black uppercase text-primary-green ml-1">
              {t('searchLabel')}
            </label>
            <div className="relative">
              <label
                htmlFor="pin-item-select"
                className="text-[10px] font-black uppercase tracking-widest text-primary-green ml-1"
              >
                {t('searchLabel')}
              </label>
              <select
                id="pin-item-select"
                value={selectedItemId}
                onChange={e => {
                  setSelectedItemId(e.target.value);
                  setErrors(prev => ({ ...prev, item: undefined }));
                }}
                className={`w-full bg-subtle-gray border-2 rounded-xl px-4 py-4 hover:border-gray-green-text/50 transition-border duration-300 outline-none focus:border-primary-green text-dark-text font-bold appearance-none shadow-sm cursor-pointer ${errors.item ? 'border-orange-800' : 'border-primary-green/10'}`}
              >
                {items.length === 0 && (
                  <option value="">
                    {pinType === 'plant' ? 'Brak roślin' : 'Brak ogrodów'}
                  </option>
                )}
                {items.map(item => {
                  const itemId = item.plant_id || item.garden_id || item.id;
                  const displayName =
                    item.nickname || item.name || `ID: ${itemId}`;

                  return (
                    <option key={itemId} value={itemId}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black opacity-50">
                ▼
              </div>
            </div>
            {errors.item && (
              <p className="text-orange-800 text-[10px] font-black uppercase tracking-widest">
                {errors.item}
              </p>
            )}

            {selectedItem && (
              <div className="flex items-center gap-4 p-3 bg-white/40 rounded-2xl border border-primary-green/5 animate-in fade-in slide-in-from-top-1">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0 border-2 border-white shadow-sm">
                  <img
                    src={
                      selectedItem.image_url ||
                      selectedItem.thumbnail ||
                      buildImageUrl(selectedItem.image || selectedItem.photo) ||
                      '/images/favicon/fav_480.webp'
                    }
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        '/images/favicon/fav_480.webp';
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-primary-green opacity">
                    {pinType === 'plant' ? t('selectPlant') : t('selectGarden')}
                  </span>
                  <span className="font-bold text-dark-text leading-tight">
                    {/* Tutaj kluczowa zmiana na nickname */}
                    {selectedItem.nickname || selectedItem.name}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/** PL: Pole tekstowe notatki EN: Note text area */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary-green ml-1">
              {t('descriptionLabel')}
            </label>
            <textarea
              maxLength={150}
              value={description}
              onChange={e => {
                setDescription(e.target.value);
                setErrors(prev => ({ ...prev, description: undefined }));
              }}
              placeholder={t('placeholder')}
              className={`w-full bg-white border-2 rounded-xl px-4 py-4 outline-none focus:border-primary-green text-dark-text min-h-[120px] resize-none shadow-sm transition-colors ${errors.description ? 'border-orange-800' : 'border-primary-green/10'}`}
            />
            <p
              className={`text-[12px] font-bold text-right pr-1 ${description.length > 150 ? 'text-red-600' : 'text-dark-text/80'}`}
            >
              {description.length}/150
            </p>
            {errors.description && (
              <p className="text-orange-800 text-[10px] font-black uppercase tracking-widest">
                {errors.description}
              </p>
            )}
          </div>

          {/** PL: Przycisk zapisu z efektem hover EN: Submit button with hover effect */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-green text-white font-black uppercase py-5 rounded-2xl shadow-xl hover:bg-primary-green hover:opacity-90 active:translate-y-0 transition-opacity disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-green"
          >
            {loading ? '...' : t('submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
