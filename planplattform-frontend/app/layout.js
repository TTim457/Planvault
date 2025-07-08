import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'

export const metadata = {
  title: 'Planplattform',
  description: 'Deine Pläne immer griffbereit',
}

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body className="font-sans min-h-screen bg-red-200 text-gray-800">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50">
          <Header />
        </header>

        {/* Hauptbereich */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-auto">
          <Footer />
        </footer>
      </body>
    </html>
  )
}
