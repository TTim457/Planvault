'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Lock,
  Mail,
  ShieldCheck,
  Bell
} from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()

  const [user,       setUser]       = useState(null)
  const [firstName,  setFirstName]  = useState('')
  const [lastName,   setLastName]   = useState('')
  const [email,      setEmail]      = useState('')

  const [oldPw,      setOldPw]      = useState('')
  const [newPw,      setNewPw]      = useState('')

  const [twoFA,      setTwoFA]      = useState(false)
  const [notif,      setNotif]      = useState(false)

  const [msgProf,    setMsgProf]    = useState('')
  const [msgPw,      setMsgPw]      = useState('')

  // initial Daten laden
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return router.push('/login')

    const load = async () => {
      // Profil
      const me = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers:{ Authorization:`Bearer ${token}` }
      })
      if (!me.ok) {
        localStorage.removeItem('token')
        return router.push('/login')
      }
      const { user } = await me.json()
      setUser(user)
      setFirstName(user.first_name)
      setLastName(user.last_name)
      setEmail(user.email)

      // Settings
      const s = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/status`, {
        headers:{ Authorization:`Bearer ${token}` }
      })
      if (s.ok) {
        const { twoFA, notif } = await s.json()
        setTwoFA(twoFA)
        setNotif(notif)
      }
    }

    load()
  },[router])

  if (!user) return <p className="p-8 text-gray-600">Lade Einstellungen…</p>

  const handleProfile = async e => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
      method:'PUT',
      headers:{
        'Content-Type':'application/json',
        Authorization:`Bearer ${token}`
      },
      body: JSON.stringify({
        first_name:firstName,
        last_name: lastName,
        email
      })
    })
    const data = await res.json()
    setMsgProf(data.success ? 'Profil aktualisiert!' : data.message||'Fehler')
  }

  const handleChangePassword = async e => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/password`, {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Authorization:`Bearer ${token}`
      },
      body: JSON.stringify({ oldPw, newPw })
    })
    const data = await res.json()
    setMsgPw(data.success ? 'Passwort geändert!' : data.error||'Fehler')
  }

  const toggle2FA = async () => {
    const token = localStorage.getItem('token')
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/2fa`, {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Authorization:`Bearer ${token}`
      },
      body: JSON.stringify({ enabled: !twoFA })
    })
    setTwoFA(!twoFA)
  }

  const toggleNotif = async () => {
    const token = localStorage.getItem('token')
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/notifications`, {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Authorization:`Bearer ${token}`
      },
      body: JSON.stringify({ enabled: !notif })
    })
    setNotif(!notif)
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8 space-y-8">
      <h1 className="flex items-center text-3xl font-bold text-gray-800">
        <ShieldCheck className="mr-2 h-6 w-6 text-blue-600"/>
        Einstellungen
      </h1>

      {/* Profil */}
      <section className="bg-white p-6 rounded-2xl shadow space-y-4 max-w-md">
        <h2 className="flex items-center text-xl font-semibold text-gray-700">
          <User className="mr-2 h-5 w-5 text-blue-600"/>
          Profil bearbeiten
        </h2>
        <form onSubmit={handleProfile} className="space-y-4">
          <div>
            <label className="block text-gray-600">Vorname</label>
            <input
              type="text" value={firstName}
              onChange={e=>setFirstName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600">Nachname</label>
            <input
              type="text" value={lastName}
              onChange={e=>setLastName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600">E-Mail</label>
            <input
              type="email" value={email}
              onChange={e=>setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Speichern
          </button>
        </form>
        {msgProf && <p className="text-sm text-gray-600">{msgProf}</p>}
      </section>

      {/* Passwort */}
      <section className="bg-white p-6 rounded-2xl shadow space-y-4 max-w-md">
        <h2 className="flex items-center text-xl font-semibold text-gray-700">
          <Lock className="mr-2 h-5 w-5 text-blue-600"/>
          Passwort ändern
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <input
            type="password" placeholder="Altes Passwort"
            value={oldPw} onChange={e=>setOldPw(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
          <input
            type="password" placeholder="Neues Passwort"
            value={newPw} onChange={e=>setNewPw(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Ändern
          </button>
        </form>
        {msgPw && <p className="text-sm text-gray-600">{msgPw}</p>}
      </section>

      {/* 2FA */}
      <section className="bg-white p-6 rounded-2xl shadow flex items-center justify-between max-w-md">
        <div className="flex items-center">
          <ShieldCheck className="mr-2 h-5 w-5 text-blue-600"/>
          <span>2-Faktor-Authentifizierung</span>
        </div>
        <button
          onClick={toggle2FA}
          className={`px-4 py-2 rounded-lg transition ${
            twoFA ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
          }`}
        >
          {twoFA ? 'Aktiviert' : 'Deaktivieren'}
        </button>
      </section>

      {/* Notifications */}
      <section className="bg-white p-6 rounded-2xl shadow flex items-center justify-between max-w-md">
        <div className="flex items-center">
          <Bell className="mr-2 h-5 w-5 text-blue-600"/>
          <span>E-Mail Benachrichtigungen</span>
        </div>
        <button
          onClick={toggleNotif}
          className={`px-4 py-2 rounded-lg transition ${
            notif ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
          }`}
        >
          {notif ? 'Aktiviert' : 'Deaktivieren'}
        </button>
      </section>
    </div>
  )
}
