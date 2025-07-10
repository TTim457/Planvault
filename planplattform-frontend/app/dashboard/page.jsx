'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');

    (async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        localStorage.removeItem('token');
        return router.push('/login');
      }
      const { user } = await res.json();
      setUser(user);
    })();
  }, [router]);

  if (!user) {
    return <p className="p-8 text-gray-600">Lade Dashboard…</p>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-gray-800">
        Willkommen zurück, {user.first_name}!
      </h1>
      <p className="mt-2 text-gray-600">Deine E-Mail: {user.email}</p>
      <p className="mt-6 text-gray-700">
        Um eine Übersicht deiner Pläne und Downloads zu sehen, besuche bitte dein{' '}
        <a
          href="/profile"
          className="text-blue-600 hover:underline"
        >
          Profil
        </a>.
      </p>
    </div>
  );
}
