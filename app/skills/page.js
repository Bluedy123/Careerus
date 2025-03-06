"use client";

import Link from "next/link";

export default function Skills() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="bg-black text-white py-20 text-center">
        <h1 className="text-5xl font-extrabold uppercase tracking-wide">
          My <span className="text-red-400">Skills</span>
        </h1>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-10">
        <h2 className="text-3xl font-semibold text-gray-900">Skills Overview</h2>
        <p className="mt-4 text-gray-700">
          This is a basic skeleton for the skills page. Add your skills content and any interactive components here.
        </p>
        {/* Navigation Back to Profile */}
        <div className="mt-6">
          <Link href="/profile">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Back to Profile
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
