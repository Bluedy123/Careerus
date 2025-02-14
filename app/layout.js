'use client';

import "./globals.css";
import Link from "next/link";
import NavItem from "./components/NavItem";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function RootLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check auth status
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <html lang="en">
      <body className="bg-gray-100">
        {/* Navbar */}
        <nav className="bg-black text-gray-300 flex items-center justify-between px-10 py-5 shadow-lg">
          <Link href="/" className="text-4xl font-extrabold tracking-wide uppercase hover:opacity-80 transition">
            <span className="text-white">Career</span>
            <span className="text-red-400">Us</span>
          </Link>

          <div className="hidden md:flex flex-grow justify-center gap-x-10 text-base font-medium tracking-normal">
            <NavItem href="/">Home</NavItem>
            <NavItem href="/skillgap">Skill Gap Checker</NavItem>
            <NavItem href="/recommendations">Recommendations</NavItem>
            <NavItem href="/trends">Trends</NavItem>
            <NavItem href="/feedback">Feedback</NavItem>
            <NavItem href="/profile">Profile</NavItem>
            <NavItem href="/help">Help</NavItem>
            <NavItem href="/about">About</NavItem>
          </div>

          {/* Conditional rendering for auth buttons */}
          <div className="flex space-x-4">
            {user ? (
              // Show sign out when user is logged in
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-white bg-red-500 rounded-md font-medium hover:bg-red-600 transition"
              >                
                Sign Out
              </button>
            ) : (
              // Show sign in/up when not logged in
              <>
                <Link href="/auth/login" className="px-4 py-2 text-white bg-gray-700 rounded-md font-medium hover:bg-gray-800 transition">
                  Sign In
                </Link>
                <Link href="/auth/register" className="px-4 py-2 text-white bg-red-500 rounded-md font-medium hover:bg-red-600 transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Page Content */}
        <main className="m-0 p-0">{children}</main>

        {/* Footer */}
        <footer className="bg-black text-gray-400 py-6 text-center">
          <h2 className="text-gray-300 text-lg font-medium tracking-wide uppercase">
            READY TO FIND <span className="text-red-400">YOUR CAREER?</span>
          </h2>
          <div className="flex justify-center space-x-6 mt-3">
            <a href="#" className="hover:text-white">🔗 LinkedIn</a>
            <a href="#" className="hover:text-white">🔗 Instagram</a>
            <a href="#" className="hover:text-white">🔗 Facebook</a>
          </div>
          <p className="mt-3">Privacy policy • Terms & Conditions</p>
        </footer>
      </body>
    </html>
  );
}
