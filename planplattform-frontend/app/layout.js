// app/layout.js
import Link from 'next/link';
import "./globals.css"; // falls du Tailwind o.ä. nutzt

export const metadata = {
  title: 'Planplattform',
  description: 'Deine Pläne immer griffbereit',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white shadow mb-8">
          <nav className="container mx-auto px-4 py-4 flex gap-4">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/login" className="hover:underline">Login</Link>
            <Link href="/register" className="hover:underline">Registrieren</Link>
            <Link href="/plans" className="hover:underline">Meine Pläne</Link>
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/admin" className="hover:underline">Admin</Link>
          </nav>
        </header>
        <main className="container mx-auto px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
