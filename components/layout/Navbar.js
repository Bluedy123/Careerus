'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold">Careerus</div>
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white">
            {isOpen ? 'Close' : 'Menu'}
          </button>
        </div>
        <div className={`md:flex space-x-4 ${isOpen ? 'block' : 'hidden'}`}>
          <Link href="/explore" className="text-white">Explore</Link>
          <Link href="/compare" className="text-white">Compare</Link>
          <Link href="/suggest" className="text-white">Suggestions</Link>
          <Link href="/login" className="text-white">Login</Link>
        </div>
      </div>
    </nav>
  );
}