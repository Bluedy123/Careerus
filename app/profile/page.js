"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Profile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "johndoe@gmail.com",
    currentRole: "Amazon Technician",
    careerGoal: "Google Developer",
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="relative bg-gray-100 min-h-screen">
      {/* Header - Consistent with Other Pages */}
      <header className="bg-black text-white py-20 text-center z-20 relative">
        <h1 className="text-5xl font-extrabold uppercase tracking-wide">
          My <span className="text-red-400">Profile</span>
        </h1>
      </header>

      {/* Content Wrapper (Less Blur) */}
      <div className={`relative ${!isLoggedIn ? "blur-sm" : ""}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row py-10 px-6">
          {/* Sidebar */}
          <aside className="md:w-1/3 bg-white shadow-lg rounded-lg p-6">
            {/* Profile Image */}
            <div className="text-center">
              <Image
                src="/profile-placeholder.jpg"
                alt="Profile Picture"
                width={100}
                height={100}
                className="rounded-full mx-auto"
              />
              <h2 className="text-2xl font-bold mt-4">{profile.name}</h2>
              <p className="text-gray-600">{profile.email}</p>
            </div>

            {/* Profile Info */}
            <div className="mt-6 border-t border-gray-300 pt-4">
              <p className="text-gray-700 font-semibold">
                Current Role: <span className="text-gray-600">{profile.currentRole}</span>
              </p>
              <p className="text-gray-700 font-semibold mt-2">
                Career Goal: <span className="text-gray-600">{profile.careerGoal}</span>
              </p>
            </div>

            {/* Sidebar Links */}
            <div className="mt-6 space-y-4">
              <SidebarLink title="Profile Overview" />
              <SidebarLink title="Skills" />
              <SidebarLink title="Career Preferences" />
              <SidebarLink title="Saved Recommendations" />
              <SidebarLink title="Employer Feedback" />
            </div>
          </aside>

          {/* Main Content */}
          <main className="md:w-2/3 md:ml-6 bg-white shadow-lg rounded-lg p-6 mt-6 md:mt-0">
            <h2 className="text-3xl font-semibold text-gray-900">Profile Overview</h2>
            <p className="text-lg text-gray-700 mt-4">
              This section will display more detailed information about the user's career progress, recommendations, and insights.
            </p>

            {/* Placeholder Report Box */}
            <div className="mt-6 p-6 border border-gray-300 rounded-lg text-center">
              <h3 className="text-xl font-semibold text-gray-800">Report Results</h3>
              <p className="text-gray-500 mt-2">No results found</p>
            </div>
          </main>
        </div>
      </div>

      {/* Login Popup Modal - Clear, with a Dark Overlay */}
      {!isLoggedIn && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center w-96 z-30">
            <h2 className="text-2xl font-bold text-gray-900">Sign In Required</h2>
            <p className="text-gray-600 mt-2">Please sign in to view your profile.</p>
            <Link href="/auth/login">
              <button
                onClick={handleLogin}
                className="mt-4 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold uppercase tracking-wider hover:bg-red-600 transition"
              >
                Sign In
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Sidebar Link Component
function SidebarLink({ title }) {
  return (
    <button className="block w-full text-left text-gray-800 font-semibold px-4 py-2 rounded-lg border-l-4 border-red-400 hover:bg-gray-200 transition">
      {title}
    </button>
  );
}
