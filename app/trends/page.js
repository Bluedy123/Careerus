"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function Trends() {
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("technology");
  const [location, setLocation] = useState("");
  const [chartData, setChartData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);

  useEffect(() => {
    fetchTrends(searchQuery, location);
  }, []);

  const fetchTrends = async (query = "technology", loc = "") => {
    setLoading(true);
    try {
      const appId = process.env.NEXT_PUBLIC_ADZUNA_APP_ID;
      const appKey = process.env.NEXT_PUBLIC_ADZUNA_APP_KEY;
      
      const locationParam = loc ? `&where=${encodeURIComponent(loc)}` : "";
      const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=10&what=${query}${locationParam}`;
      
      const response = await fetch(url, { method: "GET" });
      if (!response.ok) throw new Error("Failed to fetch job trends");
      const data = await response.json();
      setTrends(data.results || []);

      // Extract job demand & salary data
      const jobCounts = {};
      const salaryStats = [];

      data.results.forEach((job) => {
        const title = job.title;
        jobCounts[title] = (jobCounts[title] || 0) + 1;

        if (job.salary_min && job.salary_max) {
          salaryStats.push({
            title,
            salary: (job.salary_min + job.salary_max) / 2,
          });
        }
      });

      setChartData(
        Object.keys(jobCounts).map((title) => ({
          job: title,
          count: jobCounts[title],
        }))
      );

      setSalaryData(salaryStats);
    } catch (error) {
      console.error("Error fetching job trends:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-black text-white py-16 text-center">
        <h1 className="text-5xl font-extrabold uppercase tracking-wide">
          Job Market <span className="text-red-400">Trends</span>
        </h1>
        <p className="text-lg text-gray-300 mt-2">
          Stay updated with real-time industry insights.
        </p>
      </header>

      {/* Search Bar */}
      <div className="max-w-5xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Search Job Trends</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Job title (e.g. Software Engineer)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow p-4 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Location (e.g. New York, CA)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-grow p-4 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => fetchTrends(searchQuery, location)}
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>
      </div>

      {/* Charts & Job Listings */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10 p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Job Demand & Salary Insights</h2>
          <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Most In-Demand Job Titles</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <XAxis dataKey="job" tick={{ fill: "#000" }} />
                <YAxis tick={{ fill: "#000" }} />
                <Tooltip contentStyle={{ backgroundColor: "#000", color: "#fff", fontSize: "14px", fontWeight: "500" }} />
                <Bar dataKey="count" fill="#1E40AF" barSize={50} radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Average Salaries for Job Roles</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={salaryData}>
                <XAxis dataKey="title" tick={{ fill: "#000" }} />
                <YAxis tick={{ fill: "#000" }} />
                <Tooltip contentStyle={{ backgroundColor: "#000", color: "#fff", fontSize: "14px", fontWeight: "500" }} />
                <Line type="monotone" dataKey="salary" stroke="#E53E3E" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Latest Job Openings</h2>
          {loading && <p className="text-gray-500 text-center">Loading job trends...</p>}
          {!loading && trends.length === 0 && (
            <p className="text-gray-500 text-center">No results found. Try a different search.</p>
          )}
          <div className="space-y-6">
            {trends.map((trend, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-900">{trend.title}</h3>
                <p className="text-gray-700 mt-2">{trend.company.display_name}</p>
                <p className="text-gray-500">{trend.location.display_name} • ${trend.salary_min || "N/A"} - ${trend.salary_max || "N/A"}</p>
                <a href={trend.redirect_url} target="_blank" rel="noopener noreferrer" className="block mt-3 text-blue-600 font-semibold hover:underline">View More</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}