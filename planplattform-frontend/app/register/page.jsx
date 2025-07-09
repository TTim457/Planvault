'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setMessage(res.ok ? 'Registrierung erfolgreich!' : data.message || 'Fehler bei der Registrierung');
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Registrieren</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="first_name"
            placeholder="Vorname"
            value={form.first_name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
          <input
            name="last_name"
            placeholder="Nachname"
            value={form.last_name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="E-Mail"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Passwort"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Registrieren
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
        <p className="mt-4 text-sm text-gray-600">
          Bereits registriert?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Zum Login
          </Link>
        </p>
      </div>
    </div>
  );
}
