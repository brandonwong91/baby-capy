"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="w-full bg-card shadow-md mb-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex space-x-12">
            <Link
              href="/dashboard"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                pathname === "/dashboard"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/feed"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                pathname === "/feed"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              Feeds
            </Link>
            <Link
              href="/monitor"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                pathname === "/monitor"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              Monitor
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
