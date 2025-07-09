// app/page.jsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col justify-center items-center px-4">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-6xl font-extrabold text-gray-900">PlanArchiv</h1>
        <p className="text-lg text-gray-600">
          Sichere & greifbereite Pläne – jederzeit und überall.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            Registrieren
          </Link>
        </div>
      </div>
    </div>
  );
}
