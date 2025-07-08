// app/components/Header.jsx
'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <Link href="/">
          <motion.h1
            className="text-2xl font-bold text-blue-600"
            whileHover={{ scale: 1.05 }}
          >
            PlanArchiv
          </motion.h1>
        </Link>
        <nav className="space-x-4">
          <Link href="/dashboard" className="hover:text-blue-500">
            Dashboard
          </Link>
          <Link href="/plans" className="hover:text-blue-500">
            Pläne
          </Link>
          <Link href="/login" className="hover:text-blue-500">
            Login
          </Link>
        </nav>
      </div>
    </header>
  )
}
