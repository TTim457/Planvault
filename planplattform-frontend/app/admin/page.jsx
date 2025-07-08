"use client";
import React, { useEffect, useState } from "react";

// Spalten-Definitionen pro Resource
const columnsConfig = {
  users: [
    { key: "id",         label: "ID",        editable: false },
    { key: "first_name", label: "Vorname",   editable: true  },
    { key: "last_name",  label: "Nachname",  editable: true  },
    { key: "email",      label: "Email",     editable: true  },
    { key: "created_at", label: "Erstellt",  editable: false }
  ],
  photos: [
    { key: "id",         label: "ID",        editable: false },
    { key: "gallery_id", label: "Gallery ID",editable: true  },
    { key: "filename",   label: "Filename",  editable: false },
    { key: "title",      label: "Title",     editable: true  },
    { key: "file_url",   label: "File URL",  editable: false }
  ],
  downloads: [
    { key: "id",            label: "ID",          editable: false },
    { key: "user_id",       label: "User ID",     editable: false },
    { key: "photo_id",      label: "Photo ID",    editable: false },
    { key: "downloaded_at", label: "Downloaded",  editable: false },
    { key: "bezahlt",       label: "Bezahlt",     editable: true  }
  ],
  payments: [
    { key: "id",               label: "ID",       editable: false },
    { key: "user_id",          label: "User ID",  editable: false },
    { key: "photo_id",         label: "Photo ID", editable: false },
    { key: "amount",           label: "Amount",   editable: true  },
    { key: "payment_provider", label:"Provider", editable: false },
    { key: "payment_status",   label: "Status",   editable: true  },
    { key: "paid_at",          label: "Paid At",  editable: false }
  ],
  galleries: [
    { key: "id",         label: "ID",       editable: false },
    { key: "user_id",    label: "User ID",  editable: true  },
    { key: "title",      label: "Title",    editable: true  },
    { key: "created_at", label: "Erstellt", editable: false }
  ]
};

export default function AdminDashboard() {
  const [stats,     setStats]     = useState({});
  const [users,     setUsers]     = useState([]);
  const [photos,    setPhotos]    = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [payments,  setPayments]  = useState([]);
  const [galleries, setGalleries] = useState([]);

  // States für die neuen Formulare
  const [newGallery, setNewGallery] = useState({ user_id: "", title: "" });
  const [uploadData, setUploadData] = useState({ galleryId: "", title: "", file: null });

  const apiBase = "http://localhost:3000/admin";

  // alles neu laden
  const loadAll = () => {
    fetch(`${apiBase}/stats`).then(r=>r.json()).then(d=>setStats(d.stats||{}));
    fetch(`${apiBase}/users`).then(r=>r.json()).then(d=>setUsers(d.users||[]));
    fetch(`${apiBase}/photos`).then(r=>r.json()).then(d=>setPhotos(d.photos||[]));
    fetch(`${apiBase}/downloads`).then(r=>r.json()).then(d=>setDownloads(d.downloads||[]));
    fetch(`${apiBase}/payments`).then(r=>r.json()).then(d=>setPayments(d.payments||[]));
    fetch(`${apiBase}/galleries`).then(r=>r.json()).then(d=>setGalleries(d.galleries||[]));
  };

  useEffect(loadAll, []);

  // Handler Galerie anlegen
  const createGallery = async e => {
    e.preventDefault();
    const res = await fetch(`${apiBase}/galleries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: newGallery.user_id,
        title: newGallery.title
      })
    });
    if (res.ok) {
      setNewGallery({ user_id: "", title: "" });
      loadAll();
    } else {
      alert("Fehler beim Erstellen der Galerie");
    }
  };

  // Handler Foto upload
  const uploadPhoto = async e => {
    e.preventDefault();
    const form = new FormData();
    form.append("galleryId", uploadData.galleryId);
    form.append("title",     uploadData.title);
    form.append("photo",     uploadData.file);
    const res = await fetch(`${apiBase}/upload`, {
      method: "POST",
      body: form
    });
    if (res.ok) {
      setUploadData({ galleryId: "", title: "", file: null });
      loadAll();
    } else {
      alert("Fehler beim Foto-Upload");
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold">Admin Dashboard</h1>

      {/* ——— Section: Neue Galerie anlegen ——— */}
      <section className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">🗂️ Neue Galerie anlegen</h2>
        <form onSubmit={createGallery} className="space-y-4">
          <div>
            <label className="block mb-1">User ID</label>
            <input
              type="number"
              value={newGallery.user_id}
              onChange={e => setNewGallery(g => ({ ...g, user_id: e.target.value }))}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Titel</label>
            <input
              type="text"
              value={newGallery.title}
              onChange={e => setNewGallery(g => ({ ...g, title: e.target.value }))}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Galerie erstellen
          </button>
        </form>
      </section>

      {/* ——— Section: Foto hochladen ——— */}
      <section className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">📤 Foto hochladen</h2>
        <form onSubmit={uploadPhoto} className="space-y-4">
          <div>
            <label className="block mb-1">Gallery ID</label>
            <input
              type="number"
              value={uploadData.galleryId}
              onChange={e => setUploadData(u => ({ ...u, galleryId: e.target.value }))}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Titel</label>
            <input
              type="text"
              value={uploadData.title}
              onChange={e => setUploadData(u => ({ ...u, title: e.target.value }))}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Datei</label>
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
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Foto hochladen
          </button>
        </form>
      </section>


      {/* Stats */}
      <section className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-2">📊 Statistiken</h2>
        <p>👥 Users:     {stats.users}</p>
        <p>🖼️ Photos:    {stats.photos}</p>
        <p>⬇️ Downloads: {stats.downloads}</p>
        <p>💳 Payments:  {stats.payments}</p>
        <p>🗂️ Galleries: {stats.galleries}</p>
      </section>

      {/* Tabellen */}
      <CollapsibleTable
        title="👥 Users"
        data={users}
        columns={columnsConfig.users}
        apiPath="users"
        reload={loadAll}
      />
      <CollapsibleTable
        title="🖼️ Photos"
        data={photos}
        columns={columnsConfig.photos}
        apiPath="photos"
        reload={loadAll}
      />
      <CollapsibleTable
        title="⬇️ Downloads"
        data={downloads}
        columns={columnsConfig.downloads}
        apiPath="downloads"
        reload={loadAll}
      />
      <CollapsibleTable
        title="💳 Payments"
        data={payments}
        columns={columnsConfig.payments}
        apiPath="payments"
        reload={loadAll}
      />
      <CollapsibleTable
        title="🗂️ Galleries"
        data={galleries}
        columns={columnsConfig.galleries}
        apiPath="galleries"
        reload={loadAll}
      />
    </div>
  );
}


// universelle Tabelle mit Edit/Delete
function CollapsibleTable({ title, data, columns, apiPath, reload }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const pageSize = 10;
  // filter + pagination
  const filtered = data.filter(row =>
    columns.some(c =>
      String(row[c.key]).toLowerCase().includes(search.toLowerCase())
    )
  );
  const pageCount = Math.ceil(filtered.length / pageSize);
  const pageRows  = filtered.slice((page-1)*pageSize, page*pageSize);

  const base = "http://localhost:3000/admin";

  // DELETE
  const handleDelete = async id => {
    if (!confirm(`Löschen ${title.slice(0,-1)} #${id}?`)) return;
    await fetch(`${base}/${apiPath}/${id}`, { method:"DELETE" });
    reload();
  };

  // EDIT öffnen
  const handleEdit = id => {
    setEditId(id);
    const row = data.find(r=>r.id===id);
    setEditData({ ...row });
  };

  // EDIT speichern
  const handleSave = async () => {
    await fetch(`${base}/${apiPath}/${editId}`, {
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(editData)
    });
    setEditId(null);
    reload();
  };

  return (
    <section className="bg-white rounded shadow">
      <button
        onClick={()=>setOpen(o=>!o)}
        className="w-full px-4 py-3 border-b flex justify-between"
      >
        <span className="font-semibold">{title}</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="p-4">
          <input
            type="text"
            placeholder="🔍 Suchen…"
            value={search}
            onChange={e=>{ setSearch(e.target.value); setPage(1); }}
            className="mb-4 w-full px-3 py-2 border rounded"
          />

          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  {columns.map(c=>(
                    <th key={c.key} className="border p-2 text-left">{c.label}</th>
                  ))}
                  <th className="border p-2">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, i)=>(
                  <tr key={row.id} className="hover:bg-gray-50">
                    {columns.map(c=>(
                      <td key={c.key} className="border p-2">
                        {String(row[c.key])}
                      </td>
                    ))}
                    <td className="border p-2 space-x-2">
                      <button
                        onClick={()=>handleEdit(row.id)}
                        className="px-2 py-1 bg-blue-500 text-white rounded"
                      >✏️</button>
                      <button
                        onClick={()=>handleDelete(row.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded"
                      >🗑️</button>
                    </td>
                  </tr>
                ))}
                {pageRows.length===0 && (
                  <tr>
                    <td colSpan={columns.length+1} className="p-4 text-center text-gray-500">
                      Keine Einträge gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pageCount>1 && (
            <div className="flex justify-center gap-4 mt-4">
              <button
                disabled={page===1}
                onClick={()=>setPage(p=>p-1)}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >◀</button>
              <span>Seite {page} / {pageCount}</span>
              <button
                disabled={page===pageCount}
                onClick={()=>setPage(p=>p+1)}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >▶</button>
            </div>
          )}

          {/* Edit Modal */}
          {editId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow w-full max-w-lg">
                <h3 className="text-xl font-bold mb-4">
                  Bearbeite {title.slice(0,-1)} #{editId}
                </h3>
                <div className="space-y-4">
                  {columns.filter(c=>c.editable).map(c=>(
                    <div key={c.key}>
                      <label className="block font-medium">{c.label}</label>
                      <input
                        type="text"
                        value={editData[c.key] ?? ""}
                        onChange={e=>setEditData(d=>({
                          ...d,
                          [c.key]: e.target.value
                        }))}
                        className="w-full border px-3 py-2 rounded"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={()=>setEditId(null)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >Abbrechen</button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >Speichern</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

