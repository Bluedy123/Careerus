"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CareerResearchPage() {
  const [careers, setCareers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCareers, setFilteredCareers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all careers once when page loads
  useEffect(() => {
    async function fetchCareers() {
      try {
        const res = await fetch("/api/careers/all");
        if (!res.ok) throw new Error("Failed to load careers.");
        const data = await res.json();
        setCareers(data.occupation || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load careers. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCareers();
  }, []);

  // Update filtered results when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCareers([]);
      return;
    }

    const filtered = careers.filter((career) =>
      career.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredCareers(filtered);
  }, [searchTerm, careers]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-black text-white py-20 text-center">
        <h1 className="text-5xl font-extrabold uppercase tracking-wide">
          Career <span className="text-red-400">Research</span>
        </h1>
        <p className="text-lg mt-4 text-gray-300 max-w-3xl mx-auto">
          Discover in-depth information about various career paths.
        </p>
      </header>

      {/* Search Section */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-semibold text-gray-900">
            Find Your Dream Career
          </h2>
          <p className="text-lg text-gray-700 mt-2">
            Enter a career name to explore detailed insights and information.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Enter a career name..."
            className="w-full sm:w-72 border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-10">
            <div className="inline-block w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Loading careers...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center text-red-500 mb-6">{error}</div>
        )}

        {/* Results */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCareers.length > 0 ? (
              filteredCareers.map((career) => (
                <Link key={career.code} href={`/careers/${career.code}`}>
                  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {career.title}
                    </h3>
                    <p className="text-gray-600 mt-2">Code: {career.code}</p>
                  </div>
                </Link>
              ))
            ) : searchTerm.length > 0 ? (
              <div className="text-center col-span-full text-gray-500">
                No results found for “{searchTerm}”.
              </div>
            ) : (
              <div className="text-center col-span-full text-gray-500">
                Start typing to search for careers.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
