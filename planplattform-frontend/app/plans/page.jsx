'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [message, setMessage] = useState('');
  const [loadingPhotoId, setLoadingPhotoId] = useState(null);
  const [reloading, setReloading] = useState(false);
  const router = useRouter();

  const fetchPlans = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setReloading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-photos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setPlans(data);
      } else {
        setMessage('Fehler beim Laden der Pläne.');
      }
    } catch (error) {
      setMessage('Fehler beim Laden der Pläne.');
    } finally {
      setReloading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [router]);

  const handleDownload = async (photoId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/download/${photoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plan_${photoId}`;
        a.click();
        a.remove();

        // 📦 Plan nach dem Download aktualisieren
        setPlans(prevPlans =>
          prevPlans.map(plan =>
            plan.id === photoId ? { ...plan, paid: false } : plan
          )
        );

      } else {
        const data = await res.json();
        if (data.kostenpflichtig) {
          if (data.alreadyPaidButUsed) {
            if (confirm('⚠️ Dein Kauf wurde aufgebraucht. Möchtest du neu bezahlen?')) {
              handlePurchase(photoId);
            }
          } else {
            if (confirm('Du musst bezahlen, um erneut herunterzuladen. Möchtest du kaufen?')) {
              handlePurchase(photoId);
            }
          }
        } else {
          alert(data.message || 'Fehler beim Download.');
        }
      }
    } catch (error) {
      console.error('Download-Fehler:', error);
    }
  };

  const handlePurchase = async (photoId) => {
    const token = localStorage.getItem('token');
    try {
      setLoadingPhotoId(photoId);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase/${photoId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Erfolgreich gekauft! Jetzt kannst du herunterladen.');

        // 📦 Plan nach Kauf aktualisieren
        setPlans(prevPlans =>
          prevPlans.map(plan =>
            plan.id === photoId ? { ...plan, paid: true } : plan
          )
        );

      } else {
        alert(data.message || 'Fehler beim Kauf.');
      }
    } catch (error) {
      console.error('Kauf-Fehler:', error);
    } finally {
      setLoadingPhotoId(null);
    }
  };

  if (message) {
    return <p>{message}</p>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Deine Pläne</h1>

      {reloading && (
        <p style={{ marginBottom: '1rem', color: '#888' }}>🔄 Lade deine neuesten Pläne...</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {plans.map(plan => (
          <div key={plan.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
            <h3>{plan.title}</h3>

            {plan.filename && (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${plan.filename}`}
                alt={plan.title}
                style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px' }}
              />
            )}

            <button
              onClick={() => handleDownload(plan.id)}
              disabled={loadingPhotoId === plan.id}
              style={{
                marginTop: '1rem',
                backgroundColor: plan.paid ? '#4CAF50' : '#2196F3',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                border: 'none',
                cursor: loadingPhotoId === plan.id ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              {loadingPhotoId === plan.id ? '⏳ Läuft...' : plan.paid ? '✅ Gekauft: Download' : '⬇️ Download (evtl. kostenpflichtig)'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
