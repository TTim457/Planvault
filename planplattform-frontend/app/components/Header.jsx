'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Header() {
  const router = useRouter();
  const path = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  // Bei jedem Routenwechsel prüfen wir das Token
  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('token'));
  }, [path]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <Link href="/">
          <motion.h1
            className="text-2xl font-bold text-blue-600 cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            PlanArchiv
          </motion.h1>
        </Link>
        <nav className="space-x-4">
          <Link href="/dashboard" className="text-gray-700 hover:text-blue-500">
            Dashboard
          </Link>
          <Link href="/plans" className="text-gray-700 hover:text-blue-500">
            Pläne
          </Link>

          {loggedIn ? (
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 transition"
            >
              Abmelden
            </button>
          ) : (
            <Link href="/login" className="text-gray-700 hover:text-blue-500">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
