// app/page.jsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-bold mb-6">Willkommen zur Planplattform</h1>
      <p className="mb-6">Logge dich ein oder registriere dich, um deine Pläne herunterzuladen.</p>
      <div className="space-x-4">
        <Link href="/login">
          <button className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
            Login
          </button>
        </Link>
        <Link href="/register">
          <button className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700">
            Registrieren
          </button>
        </Link>
      </div>
    </div>
  );
}
