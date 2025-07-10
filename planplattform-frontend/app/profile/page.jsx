'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Folder,
  ShoppingCart,
  DownloadCloud,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [galleries, setGalleries] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [downloads, setDownloads] = useState([]);

  const [openPurchases, setOpenPurchases] = useState(false);
  const [openDownloads, setOpenDownloads] = useState(false);

  const [searchPur, setSearchPur] = useState('');
  const [pagePur, setPagePur] = useState(1);
  const [sortAscPur, setSortAscPur] = useState(true);

  const [searchDl, setSearchDl] = useState('');
  const [pageDl, setPageDl] = useState(1);
  const [sortAscDl, setSortAscDl] = useState(true);

  const PAGE_SIZE = 10;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');

    const loadAll = async () => {
      // User
      const me = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!me.ok) {
        localStorage.removeItem('token');
        return router.push('/login');
      }
      const { user } = await me.json();
      setUser(user);

      // Galerien
      const resGal = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/galleries`);
      const { galleries } = await resGal.json();
      setGalleries(galleries.filter(g => g.user_id === user.id));

      // Dashboard-Käufe
      const resDash = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resDash.ok) {
        const { purchases } = await resDash.json();
        setPurchases(purchases);
      }

      // Downloads + Titel mappen
      const resDl = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/downloads`);
      const { downloads } = await resDl.json();
      const resPhotos = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/photos`);
      const { photos } = await resPhotos.json();
      const titleMap = Object.fromEntries(photos.map(p => [p.id, p.title]));
      setDownloads(
        downloads
          .filter(d => d.user_id === user.id)
          .map(d => ({
            id: d.id,
            title: titleMap[d.photo_id] || `Foto ${d.photo_id}`,
            downloaded_at: d.downloaded_at
          }))
      );
    };

    loadAll();
  }, [router]);

  if (!user) return <p className="p-8 text-gray-600">Lade Profil…</p>;

  // Käufe filtern, sortieren, paginieren
  const filteredPur = purchases.filter(p =>
    p.title.toLowerCase().includes(searchPur.toLowerCase()) ||
    new Date(p.paid_at).toLocaleDateString().includes(searchPur)
  );
  const sortedPur = [...filteredPur].sort((a, b) =>
    sortAscPur
      ? new Date(a.paid_at) - new Date(b.paid_at)
      : new Date(b.paid_at) - new Date(a.paid_at)
  );
  const totalPagesPur = Math.ceil(sortedPur.length / PAGE_SIZE);
  const pageItemsPur = sortedPur.slice((pagePur - 1) * PAGE_SIZE, pagePur * PAGE_SIZE);

  // Downloads filtern, sortieren, paginieren
  const filteredDl = downloads.filter(d =>
    d.title.toLowerCase().includes(searchDl.toLowerCase()) ||
    new Date(d.downloaded_at).toLocaleString().includes(searchDl)
  );
  const sortedDl = [...filteredDl].sort((a, b) =>
    sortAscDl
      ? new Date(a.downloaded_at) - new Date(b.downloaded_at)
      : new Date(b.downloaded_at) - new Date(a.downloaded_at)
  );
  const totalPagesDl = Math.ceil(sortedDl.length / PAGE_SIZE);
  const pageItemsDl = sortedDl.slice((pageDl - 1) * PAGE_SIZE, pageDl * PAGE_SIZE);

  return (
    <div className="bg-gray-50 min-h-screen p-8 space-y-6">
      {/* Titel */}
      <h1 className="flex items-center text-3xl font-bold text-gray-800">
        <User className="mr-2 h-6 w-6 text-blue-600" />
        Mein Profil
      </h1>

      {/* Persönliche Daten */}
      <section className="bg-white p-6 rounded-2xl shadow space-y-2">
        <h2 className="text-xl font-semibold text-gray-700">Persönliche Daten</h2>
        <p><span className="font-medium">Name:</span> {user.first_name} {user.last_name}</p>
        <p><span className="font-medium">E-Mail:</span> {user.email}</p>
      </section>

      {/* Galerien */}
      <section className="bg-white p-6 rounded-2xl shadow">
        <Link href="/plans" className="flex items-center text-lg font-semibold text-gray-700 hover:text-blue-600">
          <Folder className="mr-2 h-5 w-5 text-blue-600" />
          Meine Galerien
        </Link>
        <ul className="mt-3 space-y-1 text-gray-700">
          {galleries.length > 0 ? galleries.map(g => (
            <li key={g.id}>• {g.title}</li>
          )) : (
            <li className="text-gray-500">Keine Galerien angelegt.</li>
          )}
        </ul>
      </section>

      {/* Gekaufte Pläne */}
      <section className="bg-white rounded-2xl shadow overflow-hidden">
        <button
          onClick={() => setOpenPurchases(o => !o)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100"
        >
          <div className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5 text-blue-600" />
            <span className="text-lg font-semibold text-gray-700">Gekaufte Pläne</span>
          </div>
          <span className="text-gray-500">{openPurchases ? '–' : '+'}</span>
        </button>
        {openPurchases && (
          <div className="p-6 space-y-4">
            {/* Sortier-Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => { setSortAscPur(true); setPagePur(1); }}
                className={`flex items-center px-3 py-1 rounded ${sortAscPur ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                <ArrowUp className="h-4 w-4 mr-1" /> Datum ↑
              </button>
              <button
                onClick={() => { setSortAscPur(false); setPagePur(1); }}
                className={`flex items-center px-3 py-1 rounded ${!sortAscPur ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                <ArrowDown className="h-4 w-4 mr-1" /> Datum ↓
              </button>
            </div>

            {/* Suche */}
            <input
              type="text"
              placeholder="Suche…"
              value={searchPur}
              onChange={e => { setSearchPur(e.target.value); setPagePur(1); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200"
            />

            {/* Liste */}
            <ul className="space-y-2 text-gray-700">
              {pageItemsPur.map((p, i) => (
                <li key={i}>
                  {p.title} –{' '}
                  <time dateTime={p.paid_at}>
                    {new Date(p.paid_at).toLocaleDateString()}
                  </time>
                </li>
              ))}
              {pageItemsPur.length === 0 && (
                <li className="text-gray-500">Keine Einträge gefunden.</li>
              )}
            </ul>

            {/* Paginierung */}
            {totalPagesPur > 1 && (
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={() => setPagePur(p => Math.max(p - 1, 1))}
                  disabled={pagePur === 1}
                  className="p-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-700" />
                </button>
                <span className="text-gray-700">Seite {pagePur} / {totalPagesPur}</span>
                <button
                  onClick={() => setPagePur(p => Math.min(p + 1, totalPagesPur))}
                  disabled={pagePur === totalPagesPur}
                  className="p-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Meine Downloads */}
      <section className="bg-white rounded-2xl shadow overflow-hidden">
        <button
          onClick={() => setOpenDownloads(o => !o)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100"
        >
          <div className="flex items-center">
            <DownloadCloud className="mr-2 h-5 w-5 text-blue-600" />
            <span className="text-lg font-semibold text-gray-700">Meine Downloads</span>
          </div>
          <span className="text-gray-500">{openDownloads ? '–' : '+'}</span>
        </button>
        {openDownloads && (
          <div className="p-6 space-y-4">
            {/* Sortier-Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => { setSortAscDl(true); setPageDl(1); }}
                className={`flex items-center px-3 py-1 rounded ${sortAscDl ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                <ArrowUp className="h-4 w-4 mr-1" /> Datum ↑
              </button>
              <button
                onClick={() => { setSortAscDl(false); setPageDl(1); }}
                className={`flex items-center px-3 py-1 rounded ${!sortAscDl ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                <ArrowDown className="h-4 w-4 mr-1" /> Datum ↓
              </button>
            </div>

            {/* Suche */}
            <input
              type="text"
              placeholder="Suche…"
              value={searchDl}
              onChange={e => { setSearchDl(e.target.value); setPageDl(1); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200"
            />

            {/* Liste */}
            <ul className="space-y-2 text-gray-700">
              {pageItemsDl.map(d => (
                <li key={d.id}>
                  {d.title} –{' '}
                  <time dateTime={d.downloaded_at}>
                    {new Date(d.downloaded_at).toLocaleString()}
                  </time>
                </li>
              ))}
              {pageItemsDl.length === 0 && (
                <li className="text-gray-500">Keine Einträge gefunden.</li>
              )}
            </ul>

            {/* Paginierung */}
            {totalPagesDl > 1 && (
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={() => setPageDl(p => Math.max(p - 1, 1))}
                  disabled={pageDl === 1}
                  className="p-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-700" />
                </button>
                <span className="text-gray-700">Seite {pageDl} / {totalPagesDl}</span>
                <button
                  onClick={() => setPageDl(p => Math.min(p + 1, totalPagesDl))}
                  disabled={pageDl === totalPagesDl}
                  className="p-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
