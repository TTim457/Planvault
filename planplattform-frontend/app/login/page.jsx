// app/login/page.jsx
'use client'
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      setMessage('Login erfolgreich!');
    } else {
      setMessage(data.message || 'Login fehlgeschlagen');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="E-Mail" type="email" onChange={handleChange} /><br />
        <input name="password" placeholder="Passwort" type="password" onChange={handleChange} /><br />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
+     <p className="mt-4 text-sm">
+       Noch keinen Account?{' '}
+       <Link href="/register" className="text-blue-600 hover:underline">
+         Registrieren
+       </Link>
+     </p>
    </div>
  );
}