"use client";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./globals.css";
import Navigation from "@/components/layout/Navbar"; 

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <AppRouterCacheProvider>
          {/* Use the standalone Navigation component */}
          <Navigation />

          {/* Page Content */}
          <main className="m-0 p-0">{children}</main>

          {/* Footer */}
          <footer className="bg-black text-gray-400 py-6 text-center">
            <h2 className="text-gray-300 text-lg font-medium tracking-wide uppercase">
              READY TO FIND{" "}
              <span className="text-red-400">YOUR CAREER?</span>
            </h2>
            <div className="flex justify-center space-x-6 mt-3">
              <a href="#" className="hover:text-white">
                🔗 LinkedIn
              </a>
              <a href="#" className="hover:text-white">
                🔗 Instagram
              </a>
              <a href="#" className="hover:text-white">
                🔗 Facebook
              </a>
            </div>
            <p className="mt-3">
              Privacy policy • Terms & Conditions
            </p>
          </footer>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
