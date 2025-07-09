'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../components/Card';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [message, setMessage] = useState('');
  const [loadingPhotoId, setLoadingPhotoId] = useState(null);
  const [reloading, setReloading] = useState(false);
  const router = useRouter();

  const fetchPlans = async () => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');
    setReloading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-photos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setPlans(data);
      else setMessage('Fehler beim Laden der Pläne.');
    } catch {
      setMessage('Fehler beim Laden der Pläne.');
    } finally {
      setReloading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, [router]);

  const handleDownload = async (photoId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/download/${photoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plan_${photoId}`;
        a.click();
        a.remove();
        setPlans(prev => prev.map(p => p.id === photoId ? { ...p, paid: false } : p));
      } else {
        const data = await res.json();
        if (data.kostenpflichtig) {
          if (data.alreadyPaidButUsed) {
            if (confirm('⚠️ Dein Kauf wurde aufgebraucht. Erneut bezahlen?')) handlePurchase(photoId);
          } else {
            if (confirm('Du musst bezahlen. Jetzt kaufen?')) handlePurchase(photoId);
          }
        } else alert(data.message || 'Fehler beim Download.');
      }
    } catch {
      alert('Download-Fehler');
    }
  };

  const handlePurchase = async (photoId) => {
    const token = localStorage.getItem('token');
    setLoadingPhotoId(photoId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase/${photoId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('✅ Erfolgreich gekauft!');
        setPlans(prev => prev.map(p => p.id === photoId ? { ...p, paid: true } : p));
      } else {
        const data = await res.json();
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
      <h1 className="text-3xl font-bold text-gray-800">Deine Pläne</h1>

      {reloading && (
        <p className="text-gray-600 mb-4">🔄 Lade deine neuesten Pläne…</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <Card
            key={plan.id}
            title={plan.title}
            imageSrc={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${plan.filename}`}
          >
            <button
              onClick={() => handleDownload(plan.id)}
              disabled={loadingPhotoId === plan.id}
              className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {loadingPhotoId === plan.id
                ? '⏳ Läuft…'
                : plan.paid
                  ? '✅ Gekauft: Download'
                  : '⬇️ Download'}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
