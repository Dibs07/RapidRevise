// components/Footer.jsx
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Rapid Revise. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link href="/terms" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
            Terms
          </Link>
          <Link href="/privacy" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
            Privacy
          </Link>
          <Link href="/contact" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}