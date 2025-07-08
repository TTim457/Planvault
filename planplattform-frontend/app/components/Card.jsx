// app/components/Card.jsx
'use client'
import { motion } from 'framer-motion'

export default function Card({ title, imageSrc, children }) {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-md overflow-hidden"
      whileHover={{ scale: 1.03, boxShadow: '0 10px 20px rgba(0,0,0,0.15)' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="text-sm text-gray-600">{children}</div>
      </div>
    </motion.div>
  )
}
