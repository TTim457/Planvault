'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, ShoppingCart, DownloadCloud } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');

    const fetchUser = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        localStorage.removeItem('token');
        return router.push('/login');
      }
      const { user } = await res.json();
      setUser(user);
    };

    const fetchDashboardData = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    };

    fetchUser().then(fetchDashboardData);
  }, [router]);

  if (!user) {
    return <p className="p-8 text-gray-600">Lade Dashboard…</p>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Willkommen zurück, {user.first_name}
      </h1>
      <p className="text-gray-600">Deine E-Mail: {user.email}</p>

      {dashboardData ? (
        <>
          <section className="bg-white p-6 rounded-2xl shadow space-y-4">
            <h2 className="flex items-center text-xl font-semibold text-gray-700">
              <ShoppingCart className="mr-2 h-6 w-6 text-blue-600" />
              Gekaufte Pläne
            </h2>
            {dashboardData.purchases.length > 0 ? (
              <ul className="space-y-2 text-gray-700">
                {dashboardData.purchases.map((p, i) => (
                  <li key={i}>
                    {p.title} – gekauft am{' '}
                    <time dateTime={p.paid_at}>
                      {new Date(p.paid_at).toLocaleDateString()}
                    </time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">Du hast noch keine Pläne gekauft.</p>
            )}
          </section>

          <section className="bg-white p-6 rounded-2xl shadow space-y-4">
            <h2 className="flex items-center text-xl font-semibold text-gray-700">
              <DownloadCloud className="mr-2 h-6 w-6 text-blue-600" />
              Letzter Download
            </h2>
            {dashboardData.lastDownload ? (
              <p className="text-gray-700">
                {dashboardData.lastDownload.title} – am{' '}
                <time dateTime={dashboardData.lastDownload.downloaded_at}>
                  {new Date(dashboardData.lastDownload.downloaded_at).toLocaleString()}
                </time>
              </p>
            ) : (
              <p className="text-gray-600">Noch kein Download durchgeführt.</p>
            )}
          </section>
        </>
      ) : (
        <p className="text-gray-600">Lade deine Inhalte…</p>
      )}
    </div>
  );
}
