// app/register/page.jsx
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
    if (res.ok) {
      setMessage('Registrierung erfolgreich!');
    } else {
      setMessage(data.message || 'Fehler bei der Registrierung');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Registrieren</h1>
      <form onSubmit={handleSubmit}>
        <input name="first_name" placeholder="Vorname" onChange={handleChange} /><br />
        <input name="last_name" placeholder="Nachname" onChange={handleChange} /><br />
        <input name="email" placeholder="E-Mail" type="email" onChange={handleChange} /><br />
        <input name="password" placeholder="Passwort" type="password" onChange={handleChange} /><br />
        <button type="submit">Registrieren</button>
      </form>
      {message && <p>{message}</p>}
      +     <p className="mt-4 text-sm">
+       Bereits registriert?{' '}
+       <Link href="/login" className="text-blue-600 hover:underline">
+         Zum Login
+       </Link>
+     </p>
    </div>
  );
}
