'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  Folder,
  ChevronRight,
  Search,
  MoreVertical,
  DownloadCloud
} from 'lucide-react'

export default function PlansPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  // Galerien
  const [galleries, setGalleries] = useState([])
  const [filteredGalleries, setFilteredGalleries] = useState([])
  const [searchGal, setSearchGal] = useState('')
  const [selectedGallery, setSelectedGallery] = useState(null)

  // Fotos
  const [photos, setPhotos] = useState([])
  const [filteredPhotos, setFilteredPhotos] = useState([])
  const [searchPhoto, setSearchPhoto] = useState('')
  const [loadingPhotoId, setLoadingPhotoId] = useState(null)

  // Bulk-Download
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [bulkLoading, setBulkLoading] = useState(false)

  // Menü-State für MoreVertical-Popup
  const [menuOpenId, setMenuOpenId] = useState(null)

  // 1) User + Galerien laden
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return router.push('/login')

    const load = async () => {
      // ➤ /me
      let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        localStorage.removeItem('token')
        return router.push('/login')
      }
      const { user } = await res.json()
      setUser(user)

      // ➤ /admin/galleries
      res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/galleries`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const { galleries } = await res.json()
      const own = galleries.filter(g => g.user_id === user.id)
      setGalleries(own)
      setFilteredGalleries(own)
    }
    load()
  }, [router])

  // 2) Galerie-Suche
  useEffect(() => {
    setFilteredGalleries(
      galleries.filter(g =>
        g.title.toLowerCase().includes(searchGal.toLowerCase())
      )
    )
  }, [searchGal, galleries])

  // 3) Galerie auswählen → Fotos laden
  const selectGallery = async g => {
    setSelectedGallery(g)
    setSearchPhoto('')
    setSelectedPhotos([])
    const token = localStorage.getItem('token')
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-photos`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    const own = data.filter(p => p.gallery_id === g.id)
    setPhotos(own)
    setFilteredPhotos(own)
  }

  // 4) Foto-Suche
  useEffect(() => {
    setFilteredPhotos(
      photos.filter(p =>
        p.title.toLowerCase().includes(searchPhoto.toLowerCase())
      )
    )
  }, [searchPhoto, photos])

  // Einzel-Download mit Bezahl-Logik (original zurückgebaut)
  const handleDownload = async photoId => {
    const token = localStorage.getItem('token')
    setLoadingPhotoId(photoId)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/download/${photoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `plan_${photoId}`
        document.body.append(a)
        a.click()
        a.remove()
      } else {
        const data = await res.json()
        if (data.kostenpflichtig) {
          if (
            confirm(
              'Zum erneuten Download ist eine Zahlung erforderlich. Jetzt kaufen?'
            )
          ) {
            await handlePurchase(photoId)
          }
        } else {
          alert(data.message || 'Download-Fehler')
        }
      }
    } catch {
      alert('Download-Fehler')
    } finally {
      setLoadingPhotoId(null)
    }
  }

  // Einzel-Kauf (original)
  const handlePurchase = async photoId => {
    const token = localStorage.getItem('token')
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/purchase/${photoId}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    if (res.ok) {
      alert('Kauf erfolgreich–starte Download …')
      await handleDownload(photoId)
    } else {
      const data = await res.json()
      alert(data.message || 'Zahlungsfehler')
    }
  }

  // Bulk-Kauf + Bulk-Download bleibt unverändert
  const handleBulkDownload = async () => {
    if (selectedPhotos.length === 0) return
    const sum = (selectedPhotos.length * 1.99).toFixed(2)
    if (!confirm(`Gesamtbetrag: €${sum} für ${selectedPhotos.length} Pläne. Jetzt bezahlen?`))
      return

    setBulkLoading(true)
    const token = localStorage.getItem('token')

    // Bulk-Kauf
    const payRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ photoIds: selectedPhotos })
    })
    if (!payRes.ok) {
      setBulkLoading(false)
      alert('Bulk-Kauf fehlgeschlagen')
      return
    }

    // Bulk-Download (ZIP)
    const dlRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/download/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ photoIds: selectedPhotos })
    })
    if (!dlRes.ok) {
      setBulkLoading(false)
      alert('Bulk-Download fehlgeschlagen')
      return
    }
    const blob = await dlRes.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk_download.zip'
    document.body.append(a)
    a.click()
    a.remove()

    setBulkLoading(false)
  }

  if (!user) {
    return <p className="p-8 text-gray-600">Lade …</p>
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-gray-600 space-x-1">
        <Link href="/profile" className="hover:text-blue-600 flex items-center">
          <User className="h-4 w-4 mr-1" /> Profil
        </Link>
        <ChevronRight className="h-4 w-4" />
        {selectedGallery ? (
          <>
            <button
              onClick={() => setSelectedGallery(null)}
              className="hover:text-blue-600"
            >
              Galerien
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-gray-800">
              {selectedGallery.title}
            </span>
          </>
        ) : (
          <span className="font-medium text-gray-800">Galerien</span>
        )}
      </nav>

      <h1 className="text-3xl font-bold text-gray-800">
        {selectedGallery
          ? `Fotos in „${selectedGallery.title}“`
          : 'Deine Galerien'}
      </h1>

      {/* Galerie-Suche */}
      {!selectedGallery && (
        <div className="max-w-md">
          <div className="relative text-gray-600 mb-4">
            <Search className="absolute top-2 left-3 h-4 w-4" />
            <input
              type="text"
              placeholder="Galerie suchen …"
              value={searchGal}
              onChange={e => setSearchGal(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      )}

      {/* Galerie-Kacheln */}
      {!selectedGallery && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGalleries.map(g => (
            <div
              key={g.id}
              onClick={() => selectGallery(g)}
              className="cursor-pointer bg-white p-4 rounded-xl shadow
                         hover:shadow-md flex items-center space-x-3 transition"
            >
              <Folder className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-medium text-gray-700 truncate">
                {g.title}
              </span>
            </div>
          ))}
          {filteredGalleries.length === 0 && (
            <p className="text-gray-600 col-span-full">
              Keine Galerien gefunden.
            </p>
          )}
        </div>
      )}

      {/* Foto-Bereich */}
      {selectedGallery && (
        <>
          {/* Suche + Bulk & Zähler */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative text-gray-600 mb-4 w-full sm:w-auto">
              <Search className="absolute top-2 left-3 h-4 w-4" />
              <input
                type="text"
                placeholder="Fotos suchen …"
                value={searchPhoto}
                onChange={e => setSearchPhoto(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {selectedPhotos.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {selectedPhotos.length} ausgewählt
                </span>
                <button
                  onClick={handleBulkDownload}
                  disabled={bulkLoading}
                  className="flex items-center px-4 py-2 bg-gray-800 text-white
                             rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
                >
                  <DownloadCloud className="h-5 w-5 mr-2" />
                  {bulkLoading ? 'Bezahlvorgang …' : 'Herunterladen'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map(photo => (
              <div
                key={photo.id}
                className="relative bg-white rounded-xl shadow overflow-hidden"
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedPhotos.includes(photo.id)}
                  onChange={() => {
                    setSelectedPhotos(sel =>
                      sel.includes(photo.id)
                        ? sel.filter(i => i !== photo.id)
                        : [...sel, photo.id]
                    )
                  }}
                  className="absolute top-2 left-2 h-4 w-4 text-blue-600
                             bg-white border-gray-300 rounded"
                />

                {/* Vorschaubild */}
                <img
                  src={photo.file_url}
                  alt={photo.title}
                  className="w-full h-28 object-cover"
                />

                {/* Titel + Menü */}
                <div className="p-2 flex justify-between items-center">
                  <span className="text-gray-800 font-medium truncate">
                    {photo.title}
                  </span>
                  <button
                    onClick={() =>
                      setMenuOpenId(prev =>
                        prev === photo.id ? null : photo.id
                      )
                    }
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                {/* Info-Popup */}
                {menuOpenId === photo.id && (
                  <div className="absolute top-2 right-2 bg-white border-gray-200 rounded-lg shadow-lg z-10 text-sm p-2 space-y-1">
                    <div className="text-gray-700">
                      <strong>Dateiname:</strong> {photo.filename}
                    </div>
                    <div className="text-gray-700">
                      <strong>Hochgeladen:</strong>{' '}
                      {new Date(photo.uploaded_at).toLocaleString()}
                    </div>
                    <button
                      onClick={() => setMenuOpenId(null)}
                      className="mt-1 text-xs text-blue-600 hover:underline"
                    >
                      Schließen
                    </button>
                  </div>
                )}

                {/* Download-Button */}
                <div className="p-2">
                  <button
                    onClick={() => handleDownload(photo.id)}
                    disabled={loadingPhotoId === photo.id}
                    className="w-full flex justify-center items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loadingPhotoId === photo.id
                      ? 'Bitte warten …'
                      : (
                        <>
                          <DownloadCloud className="h-4 w-4 mr-1" />
                          Download
                        </>
                      )}
                  </button>
                </div>
              </div>
            ))}
            {filteredPhotos.length === 0 && (
              <p className="text-gray-600 col-span-full">
                Keine Fotos gefunden.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
