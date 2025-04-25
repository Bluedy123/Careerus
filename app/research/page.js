"use client";

import { useState } from "react";
import Link from "next/link";

export default function CareerResearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/careers?query=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error('Failed to fetch careers.');
      const data = await res.json();
      setResults(data.occupation || []);
    } catch (err) {
      console.error("Error fetching careers:", err);
      setError("There was an error fetching data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header Section */}
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

        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter a career name..."
            className="w-full sm:w-72 border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="submit"
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold uppercase tracking-wider hover:bg-red-600 transition"
          >
            Search
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="text-center text-red-500 mb-6">{error}</div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="text-center py-6">
            <div className="inline-block w-6 h-6 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700 mt-2">Searching careers...</p>
          </div>
        )}

        {/* Results Section */}
        {!isLoading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((career) => (
              <Link key={career.code} href={`/careers/${career.code}`}>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {career.title}
                  </h3>
                  <p className="text-gray-700 mt-2">
                    Code: {career.code}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {!isLoading && results.length === 0 && searchTerm.length > 0 && !error && (
          <div className="text-center mt-6 text-gray-500">
            No results found for “{searchTerm}”.
          </div>
        )}
      </section>
    </div>
  );
}
