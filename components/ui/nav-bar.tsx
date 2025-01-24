"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="w-full bg-white shadow-sm mb-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex space-x-8">
            <Link
              href="/dashboard"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                pathname === "/dashboard"
                  ? "border-blue-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/feed"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                pathname === "/feed"
                  ? "border-blue-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Feeds
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
