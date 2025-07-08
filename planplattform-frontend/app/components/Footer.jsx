// app/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-12">
      <div className="max-w-7xl mx-auto text-center text-sm text-gray-500 p-4">
        © {new Date().getFullYear()} PlanArchiv. Alle Rechte vorbehalten.
      </div>
    </footer>
  )
}
