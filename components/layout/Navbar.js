'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Navigation() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

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

    // Close dropdown and mobile menu when clicking outside
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown]);

  // Reset mobile menu on navigation
  useEffect(() => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleDropdown = (name, event) => {
    // Stop event propagation to prevent immediate closing
    if (event) {
      event.stopPropagation();
    }
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Navigation categories
  const navCategories = [
    {
      name: "explore",
      label: "Explore",
      items: [
        { label: "Research", href: "/research" },
        { label: "Search Jobs", href: "/jobs" },
        { label: "Resume Builder", href: "/resume-builder" },
        { label: "Recommendations", href: "/recommendations" },
        { label: "Skill Gap Checker", href: "/skillgap" },
        { label: "Market Trends", href: "/trends" }
      ]
    },
    {
      name: "profile",
      label: "Profile",
      items: [
        { label: "My Profile", href: "/profile" },
        { label: "Skills Management", href: "/skillmanagement" },
        { label: "Career Preferences", href: "/careerpreferences" },
        { label: "Career Report", href: "/career-report" },
        { label: "Feedback", href: "/feedback" },
        { label: "Dashboard", href: "/dashboards" }
      ]
    },
    {
      name: "resources",
      label: "Resources",
      items: [
        { label: "Help", href: "/help" },
        { label: "About", href: "/about" }
      ]
    }
  ];

  return (
    <nav className="bg-black text-gray-300 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <span className="text-3xl font-extrabold tracking-wide uppercase">
              <span className="text-white">Career</span>
              <span className="text-red-400">Us</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <Link 
                href="/" 
                className={`px-4 py-3 rounded-md text-base font-medium ${
                  pathname === "/" 
                    ? "text-white bg-gray-900" 
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                Home
              </Link>

              {/* Category Dropdowns */}
              {navCategories.map((category) => (
                <div key={category.name} className="relative dropdown-container">
                  <button
                    className={`px-4 py-3 rounded-md text-base font-medium ${
                      pathname && category.items.some(item => pathname === item.href)
                        ? "text-white bg-gray-900"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                    onClick={(e) => toggleDropdown(category.name, e)}
                  >
                    {category.label}
                    <svg 
                      className={`ml-1 w-4 h-4 inline-block transition-transform ${openDropdown === category.name ? "transform rotate-180" : ""}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {openDropdown === category.name && (
                    <div 
                      className="absolute left-0 z-50 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="py-1">
                        {category.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`block px-4 py-3 text-base ${
                              pathname === item.href
                                ? "bg-gray-100 text-gray-900 font-medium"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Authentication buttons */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="px-4 py-3 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Sign Out
                </button>
              ) : (
                <div className="flex space-x-3">
                  <Link
                    href="/auth/login"
                    className="px-4 py-3 rounded-md text-base font-medium text-white bg-gray-700 hover:bg-gray-600"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-3 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 absolute z-50 w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className={`block px-4 py-3 rounded-md text-base font-medium ${
                pathname === "/" ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Home
            </Link>

            {/* Mobile category accordions */}
            {navCategories.map((category) => (
              <div key={category.name} className="space-y-1">
                <button
                  className="w-full flex justify-between items-center px-4 py-3 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={(e) => toggleDropdown(category.name, e)}
                >
                  <span>{category.label}</span>
                  <svg
                    className={`ml-1 w-4 h-4 transition-transform ${openDropdown === category.name ? "transform rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {openDropdown === category.name && (
                  <div className="pl-4 space-y-1">
                    {category.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-4 py-3 rounded-md text-base font-medium ${
                          pathname === item.href
                            ? "bg-gray-800 text-white"
                            : "text-gray-400 hover:bg-gray-700 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile authentication */}
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="px-2 space-y-1">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-3 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block px-4 py-3 rounded-md text-base font-medium text-white bg-gray-700 hover:bg-gray-600"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block px-4 py-3 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

  