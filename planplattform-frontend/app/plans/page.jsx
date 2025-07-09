'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, ImageIcon } from 'lucide-react';

export default function PlansPage() {
  const [galleries, setGalleries]       = useState([]);
  const [photos,     setPhotos]         = useState([]);
  const [selectedGallery, setSelected] = useState(null);
  const [message,    setMessage]        = useState('');
  const [loading,    setLoading]        = useState(false);
  const [loadingPhotoId, setLoadingPhotoId] = useState(null);
  const router = useRouter();
  const token  = typeof window !== 'undefined' && localStorage.getItem('token');

  // 1️⃣ Galerien laden
  useEffect(() => {
    if (!token) return router.push('/login');
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-galleries`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setGalleries(d))
      .catch(() => setMessage('Fehler beim Laden der Galerien.'))
      .finally(() => setLoading(false));
  }, [router, token]);

  // 2️⃣ Fotos laden (einmalig)
  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-photos`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setPhotos(d))
      .catch(() => {});
  }, [token]);

  const filteredPhotos = selectedGallery
    ? photos.filter(p => String(p.gallery_id) === String(selectedGallery.id))
    : [];

  // 📥 Download-/Payment-Logic
  const handleDownload = async (photoId) => {
    setLoadingPhotoId(photoId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/download/${photoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `plan_${photoId}`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const data = await res.json();
        if (data.kostenpflichtig) {
          const text = data.alreadyPaidButUsed
            ? '⚠️ Dein Guthaben ist aufgebraucht – neu bezahlen?'
            : '🔒 Du musst bezahlen, um erneut herunterzuladen.';
          if (confirm(text)) {
            await handlePurchase(photoId);
          }
        } else {
          alert(data.message || 'Fehler beim Download.');
        }
      }
    } catch {
      alert('Download-Fehler');
    } finally {
      setLoadingPhotoId(null);
    }
  };

  const handlePurchase = async (photoId) => {
    setLoadingPhotoId(photoId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase/${photoId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ Zahlung erfolgreich – Download startet jetzt.');
        // direkt downloaden:
        await handleDownload(photoId);
      } else {
        alert(data.message || 'Fehler beim Kauf.');
      }
    } catch {
      alert('Kauf-Fehler');
    } finally {
      setLoadingPhotoId(null);
    }
  };

  if (message) {
    return <p className="p-8 text-gray-600">{message}</p>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8 space-y-6">
      {/* Überschrift */}
      <h1 className="text-3xl font-bold text-gray-800">
        {selectedGallery ? selectedGallery.title : 'Deine Galerien'}
      </h1>

      {/* → Zurück-Button */}
      {selectedGallery && (
        <button
          onClick={() => setSelected(null)}
          className="text-blue-600 hover:underline mb-4"
        >
          ← zurück zu Galerien
        </button>
      )}

      {/* Lade‐Spinner */}
      {loading && <p className="text-gray-600">🔄 Lädt…</p>}

      {/* ① Galerie‐Liste */}
      {!selectedGallery && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map(g => (
            <button
              key={g.id}
              onClick={() => setSelected(g)}
              className="flex flex-col items-center p-6 bg-white rounded-2xl shadow hover:shadow-lg transition"
            >
              <Folder className="h-12 w-12 text-blue-500 mb-4" />
              <span className="font-semibold text-gray-800">{g.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* ② Foto‐Grid */}
      {selectedGallery && (
        filteredPhotos.length === 0
          ? <p className="text-gray-600">Keine Fotos in dieser Galerie.</p>
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhotos.map(photo => (
                <div
                  key={photo.id}
                  className="bg-white rounded-2xl shadow overflow-hidden flex flex-col"
                >
                  <img
                    src={photo.file_url}
                    alt={photo.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-800">{photo.title}</h3>
                    <button
                      onClick={() => handleDownload(photo.id)}
                      disabled={loadingPhotoId === photo.id}
                      className="mt-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      {loadingPhotoId === photo.id
                        ? '⏳ Lädt…'
                        : photo.paid
                          ? '⬇️ Download'
                          : '🔒 Kaufen & Download'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
      )}
    </div>
  );
}
