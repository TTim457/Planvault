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
    if (!token) return router.push('/login');

    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const { user } = await res.json();
        setUser(user);
      } catch {
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard-data`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setDashboardData(data);
      } catch {
        console.error('Dashboard Fetch Error');
      }
    };

    fetchUser().then(fetchDashboardData);
  }, [router]);

  if (!user) {
    return <p className="p-8 text-gray-600">Lade Dashboard…</p>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Willkommen zurück, {user.first_name} 👋</h1>
      <p className="text-gray-600">Deine E-Mail: {user.email}</p>

      {dashboardData ? (
        <>
          <hr className="my-6 border-gray-200" />
          <section className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">🛍️ Deine gekauften Pläne</h2>
            {dashboardData.purchases.length > 0 ? (
              <ul className="space-y-2 text-gray-700">
                {dashboardData.purchases.map((p, i) => (
                  <li key={i}>📦 {p.title} – gekauft am {new Date(p.paid_at).toLocaleDateString()}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">Du hast noch keine Pläne gekauft.</p>
            )}
          </section>

          <hr className="my-6 border-gray-200" />
          <section className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">⬇️ Letzter Download</h2>
            {dashboardData.lastDownload ? (
              <p className="text-gray-700">
                {dashboardData.lastDownload.title} – am{' '}
                {new Date(dashboardData.lastDownload.downloaded_at).toLocaleString()}
              </p>
            ) : (
              <p className="text-gray-600">Du hast noch keinen Download durchgeführt.</p>
            )}
          </section>
        </>
      ) : (
        <p className="text-gray-600">Lade deine Inhalte…</p>
      )}
    </div>
  );
}
