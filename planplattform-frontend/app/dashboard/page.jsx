'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Token ungültig oder abgelaufen');
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error('[User Fetch Error]', err);
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard-data`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.warn('[Dashboard-Daten konnten nicht geladen werden]');
          return;
        }

        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        console.error('[Dashboard Fetch Error]', err);
      }
    };

    fetchUser().then(fetchDashboardData);
  }, [router]);

  if (!user) {
    return <p>{message || 'Lade Dashboard...'}</p>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Willkommen zurück, {user.first_name} 👋</h1>
      <p>Deine E-Mail: {user.email}</p>

      {dashboardData ? (
        <>
          <hr style={{ margin: '2rem 0' }} />

          <h2>🛍️ Deine gekauften Pläne</h2>
          {dashboardData.purchases.length > 0 ? (
            <ul>
              {dashboardData.purchases.map((purchase, index) => (
                <li key={index}>
                  📦 {purchase.title} – gekauft am{' '}
                  {new Date(purchase.paid_at).toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>Du hast noch keine Pläne gekauft.</p>
          )}

          <hr style={{ margin: '2rem 0' }} />

          <h2>⬇️ Letzter Download</h2>
          {dashboardData.lastDownload ? (
            <p>
              {dashboardData.lastDownload.title} – am{' '}
              {new Date(dashboardData.lastDownload.downloaded_at).toLocaleString()}
            </p>
          ) : (
            <p>Du hast noch keinen Download durchgeführt.</p>
          )}
        </>
      ) : (
        <p>Lade deine Inhalte...</p>
      )}
    </div>
  );
}
