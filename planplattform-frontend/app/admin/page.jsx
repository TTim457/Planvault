'use client';
import React, { useEffect, useState } from 'react';
import {
  Users,
  ImageIcon,
  DownloadCloud,
  CreditCard,
  Folder,
  BarChart
} from 'lucide-react';

// Spalten-Definitionen mit den neuen Feldern
const columnsConfig = {
  users: [
    { key: 'id',         label: 'ID',        editable: false },
    { key: 'first_name', label: 'Vorname',   editable: true  },
    { key: 'last_name',  label: 'Nachname',  editable: true  },
    { key: 'email',      label: 'E-Mail',    editable: true  },
    { key: 'created_at', label: 'Erstellt',  editable: false }
  ],
  photos: [
    { key: 'id',         label: 'ID',         editable: false },
    { key: 'gallery_id', label: 'Galerie-ID', editable: true  },
    { key: 'filename',   label: 'Dateiname',  editable: false },
    { key: 'title',      label: 'Titel',      editable: true  },
    { key: 'file_url',   label: 'URL',        editable: false }
  ],
  downloads: [
    { key: 'id',            label: 'ID',        editable: false },
    { key: 'user_id',       label: 'User-ID',   editable: false },
    { key: 'photo_id',      label: 'Foto-ID',   editable: false },
    { key: 'downloaded_at', label: 'Geladen',   editable: false },
    { key: 'bezahlt',       label: 'Bezahlt',   editable: true  },
    { key: 'purchase_type', label: 'Typ',       editable: false }
  ],
  payments: [
    { key: 'id',               label: 'ID',          editable: false },
    { key: 'user_id',          label: 'User-ID',     editable: false },
    { key: 'photo_id',         label: 'Foto-ID',     editable: false },
    { key: 'photo_ids',        label: 'Foto-IDs',    editable: false },
    { key: 'amount',           label: 'Betrag',      editable: true  },
    { key: 'purchase_type',    label: 'Typ',         editable: false },
    { key: 'payment_provider', label: 'Provider',    editable: false },
    { key: 'payment_status',   label: 'Status',      editable: true  },
    { key: 'paid_at',          label: 'Bezahlt am',  editable: false }
  ],
  galleries: [
    { key: 'id',         label: 'ID',       editable: false },
    { key: 'user_id',    label: 'User-ID',  editable: true  },
    { key: 'title',      label: 'Titel',    editable: true  },
    { key: 'created_at', label: 'Erstellt', editable: false }
  ]
};

export default function AdminDashboard() {
  const [stats,     setStats]     = useState({});
  const [users,     setUsers]     = useState([]);
  const [photos,    setPhotos]    = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [payments,  setPayments]  = useState([]);
  const [galleries, setGalleries] = useState([]);

  const [newGallery, setNewGallery] = useState({ user_id: '', title: '' });
  const [uploadData, setUploadData] = useState({ galleryId: '', title: '', file: null });

  const apiBase = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/admin`;

  // Lädt alle Daten
  const loadAll = () => {
    fetch(`${apiBase}/stats`)
      .then(r => r.json()).then(d => setStats(d.stats || {}));

    fetch(`${apiBase}/users`)
      .then(r => r.json()).then(d => setUsers(d.users || []));

    fetch(`${apiBase}/photos`)
      .then(r => r.json()).then(d => setPhotos(d.photos || []));

    fetch(`${apiBase}/downloads`)
      .then(r => r.json()).then(d => setDownloads(d.downloads || []));

    fetch(`${apiBase}/payments`)
      .then(r => r.json()).then(d => setPayments(d.payments || []));

    fetch(`${apiBase}/galleries`)
      .then(r => r.json()).then(d => setGalleries(d.galleries || []));
  };

  useEffect(loadAll, []);

  // Neue Galerie anlegen
  const createGallery = async e => {
    e.preventDefault();
    const res = await fetch(`${apiBase}/galleries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGallery),
    });
    if (res.ok) {
      setNewGallery({ user_id: '', title: '' });
      loadAll();
    } else {
      alert('Fehler beim Erstellen der Galerie');
    }
  };

  // Foto hochladen
  const uploadPhoto = async e => {
    e.preventDefault();
    const form = new FormData();
    form.append('galleryId', uploadData.galleryId);
    form.append('title',     uploadData.title);
    form.append('photo',     uploadData.file);
    const res = await fetch(`${apiBase}/upload`, { method: 'POST', body: form });
    if (res.ok) {
      setUploadData({ galleryId: '', title: '', file: null });
      loadAll();
    } else {
      alert('Fehler beim Foto-Upload');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8 space-y-8">
      <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>

      {/* KPI-Karten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<Users className="h-8 w-8 text-blue-600" />}    label="Users"     value={stats.users} />
        <StatCard icon={<ImageIcon className="h-8 w-8 text-blue-600" />} label="Photos"   value={stats.photos} />
        <StatCard icon={<DownloadCloud className="h-8 w-8 text-blue-600" />} label="Downloads" value={stats.downloads} />
        <StatCard icon={<CreditCard className="h-8 w-8 text-blue-600" />} label="Payments"  value={stats.payments} />
        <StatCard icon={<Folder className="h-8 w-8 text-blue-600" />}     label="Galleries" value={stats.galleries} />
      </div>

      {/* Section: Neue Galerie */}
      <section className="bg-white p-6 rounded-2xl shadow">
        <h2 className="flex items-center text-2xl font-semibold text-gray-700 mb-4">
          <Folder className="mr-2 h-6 w-6 text-blue-600" /> Neue Galerie anlegen
        </h2>
        <form onSubmit={createGallery} className="space-y-4 max-w-md">
          <div>
            <label className="block mb-1 text-gray-600">User-ID</label>
            <input
              type="number"
              value={newGallery.user_id}
              onChange={e => setNewGallery(g => ({ ...g, user_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">Titel</label>
            <input
              type="text"
              value={newGallery.title}
              onChange={e => setNewGallery(g => ({ ...g, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Erstellen
          </button>
        </form>
      </section>

      {/* Section: Foto hochladen */}
      <section className="bg-white p-6 rounded-2xl shadow">
        <h2 className="flex items-center text-2xl font-semibold text-gray-700 mb-4">
          <ImageIcon className="mr-2 h-6 w-6 text-blue-600" /> Foto hochladen
        </h2>
        <form onSubmit={uploadPhoto} className="space-y-4 max-w-md">
          <div>
            <label className="block mb-1 text-gray-600">Galerie-ID</label>
            <input
              type="number"
              value={uploadData.galleryId}
              onChange={e => setUploadData(u => ({ ...u, galleryId: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">Titel</label>
            <input
              type="text"
              value={uploadData.title}
              onChange={e => setUploadData(u => ({ ...u, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">Datei</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setUploadData(u => ({ ...u, file: e.target.files[0] }))}
              className="w-full"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Hochladen
          </button>
        </form>
      </section>

      {/* Collapsible Tables */}
      <CollapsibleTable
        icon={<Users className="mr-2 h-5 w-5 text-blue-600" />}
        title="Users"
        data={users}
        columns={columnsConfig.users}
        apiPath="users"
        reload={loadAll}
      />
      <CollapsibleTable
        icon={<ImageIcon className="mr-2 h-5 w-5 text-blue-600" />}
        title="Photos"
        data={photos}
        columns={columnsConfig.photos}
        apiPath="photos"
        reload={loadAll}
      />
      <CollapsibleTable
        icon={<DownloadCloud className="mr-2 h-5 w-5 text-blue-600" />}
        title="Downloads"
        data={downloads}
        columns={columnsConfig.downloads}
        apiPath="downloads"
        reload={loadAll}
      />
      <CollapsibleTable
        icon={<CreditCard className="mr-2 h-5 w-5 text-blue-600" />}
        title="Payments"
        data={payments}
        columns={columnsConfig.payments}
        apiPath="payments"
        reload={loadAll}
      />
      <CollapsibleTable
        icon={<Folder className="mr-2 h-5 w-5 text-blue-600" />}
        title="Galleries"
        data={galleries}
        columns={columnsConfig.galleries}
        apiPath="galleries"
        reload={loadAll}
      />
    </div>
  );
}

// KPI-Karte
function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow flex items-center space-x-4">
      {icon}
      <div>
        <p className="text-2xl font-bold text-gray-800">{value ?? 0}</p>
        <p className="text-gray-600">{label}</p>
      </div>
    </div>
  );
}

// Wiederverwendbare, einklappbare Tabelle mit Sortierung nach ID
function CollapsibleTable({ icon, title, data, columns, apiPath, reload }) {
  const [open,      setOpen]      = useState(false);
  const [search,    setSearch]    = useState('');
  const [sortAsc,   setSortAsc]   = useState(true);
  const [page,      setPage]      = useState(1);
  const [editId,    setEditId]    = useState(null);
  const [editData,  setEditData]  = useState({});
  const pageSize = 10;

  // 1) sortieren
  const sorted = [...data].sort((a, b) =>
    sortAsc ? a.id - b.id : b.id - a.id
  );

  // 2) filtern
  const filtered = sorted.filter(row =>
    columns.some(c =>
      String(row[c.key] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  // 3) paginieren
  const pageCount = Math.ceil(filtered.length / pageSize);
  const pageRows  = filtered.slice((page - 1) * pageSize, page * pageSize);

  const base = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/admin`;

  const handleDelete = async id => {
    if (!confirm(`Löschen ${title} #${id}?`)) return;
    await fetch(`${base}/${apiPath}/${id}`, { method: 'DELETE' });
    reload();
  };

  const handleEdit = id => {
    setEditId(id);
    setEditData(data.find(r => r.id === id));
  };

  const handleSave = async () => {
    await fetch(`${base}/${apiPath}/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    });
    setEditId(null);
    reload();
  };

  return (
    <section className="bg-white rounded-2xl shadow">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 border-b flex items-center justify-between"
      >
        <div className="flex items-center">
          {icon}
          <span className="font-semibold text-gray-700 ml-2">{title}</span>
        </div>
        <span className="text-gray-500">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="p-4">
          {/* Suche + Sortieren */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
            <input
              type="text"
              placeholder="Suchen…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full sm:w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200"
            />
            <div className="space-x-2">
              <button
                onClick={() => { setSortAsc(true); setPage(1); }}
                className={`px-2 py-1 rounded ${sortAsc ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                ID ↑
              </button>
              <button
                onClick={() => { setSortAsc(false); setPage(1); }}
                className={`px-2 py-1 rounded ${!sortAsc ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                ID ↓
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  {columns.map(c => (
                    <th key={c.key} className="border-b px-4 py-2 text-left text-gray-600 uppercase text-xs">
                      {c.label}
                    </th>
                  ))}
                  <th className="border-b px-4 py-2 text-left text-gray-600 uppercase text-xs">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {columns.map(c => (
                      <td key={c.key} className="border-b px-4 py-2 text-gray-700">
                        {Array.isArray(row[c.key]) ? row[c.key].join(', ') : String(row[c.key] ?? '')}
                      </td>
                    ))}
                    <td className="border-b px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleEdit(row.id)}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="p-4 text-center text-gray-500">
                      Keine Einträge gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex justify-center gap-4 mt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                ◀
              </button>
              <span className="text-gray-700">Seite {page} / {pageCount}</span>
              <button
                disabled={page === pageCount}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                ▶
              </button>
            </div>
          )}

          {/* Edit-Modal */}
          {editId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Bearbeite {title} #{editId}
                </h3>
                <div className="space-y-4">
                  {columns.filter(c => c.editable).map(c => (
                    <div key={c.key}>
                      <label className="block mb-1 text-gray-600">{c.label}</label>
                      <input
                        type="text"
                        value={editData[c.key] ?? ''}
                        onChange={e => setEditData(d => ({ ...d, [c.key]: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setEditId(null)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Speichern
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
