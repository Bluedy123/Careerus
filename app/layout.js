import "./globals.css"; // Ensure Tailwind or custom styles are loaded
import Link from "next/link";

export const metadata = {
  title: "Careerus",
  description: "Find your perfect career path",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        {/* Navbar */}
        <nav className="bg-black text-white flex items-center justify-between px-10 py-5">
          <div className="text-3xl font-extrabold">
            <span className="text-white">CAREER</span>
            <span className="text-red-500">US</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <NavItem href="/">Home</NavItem>
            <NavItem href="/skill-gap">Skill Gap Checker</NavItem>
            <NavItem href="/recommendations">Recommendations</NavItem>
            <NavItem href="/trends">Trends</NavItem>
            <NavItem href="/feedback">Feedback</NavItem>
            <NavItem href="/profile">Profile</NavItem>
            <NavItem href="/help">Help</NavItem>
            <NavItem href="/about">About</NavItem>
          </div>
          <div className="flex space-x-4">
            <Link href="/auth/login" className="bg-gray-700 px-4 py-2 text-white rounded-md hover:bg-gray-800">
              Sign In
            </Link>
            <Link href="/auth/register" className="bg-red-500 px-4 py-2 text-white rounded-md hover:bg-red-600">
              Sign Up
            </Link>
          </div>
        </nav>

        {/* Page Content */}
        <main className="py-10">{children}</main>

        {/* Footer */}
        <footer className="bg-black text-gray-400 py-6 text-center">
          <h2 className="text-white text-xl font-semibold">
            READY TO FIND <span className="text-red-500">YOUR CAREER?</span>
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

// Navigation Item Component
function NavItem({ href, children }) {
  return (
    <Link href={href} className="text-gray-300 hover:text-white transition">
      {children}
    </Link>
  );
}
