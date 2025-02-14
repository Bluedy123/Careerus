"use client"; // ✅ Required to use hooks in Next.js

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavItem({ href, children }) {
  const pathname = usePathname(); // ✅ Get current page URL
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`relative text-gray-300 hover:text-white transition uppercase tracking-wider ${
        isActive ? "text-white after:absolute after:left-0 after:bottom-[-4px] after:w-full after:h-[2px] after:bg-red-500" : ""
      }`}
    >
      {children}
    </Link>
  );
}
