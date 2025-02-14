"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function Trends() {
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("software");
  const [chartData, setChartData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);

  useEffect(() => {
    fetchTrends(searchQuery);
  }, []);

  const fetchTrends = async (query = "technology") => {
    setLoading(true);
    try {
      const appId = process.env.NEXT_PUBLIC_ADZUNA_APP_ID;
      const appKey = process.env.NEXT_PUBLIC_ADZUNA_APP_KEY;

      const response = await fetch(
        `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=10&what=${query}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch job trends");
      const data = await response.json();
      setTrends(data.results || []);

      // Extract data for visualization
      const jobCounts = {};
      const salaryStats = [];

      data.results.forEach((job) => {
        const title = job.title.split(" ")[0]; // Extract first word of job title
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
          Visualize industry demand and salary trends.
        </p>
      </header>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto mt-8 p-4">
        <input
          type="text"
          placeholder="Search job trends (e.g. Software Engineer, Marketing)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-md shadow-sm text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          onClick={() => fetchTrends(searchQuery)}
          className="mt-4 w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
        >
          Search Trends
        </button>
      </div>

      {/* Trends Visualization */}
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-10 mt-8 space-y-6">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Job Trends Overview</h2>

        {/* Job Demand Chart */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Job Demand by Title</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="job" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3182CE" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center">No data available</p>
          )}
        </div>

        {/* Salary Trends Chart */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Average Salaries</h3>
          {salaryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salaryData}>
                <XAxis dataKey="title" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="salary" stroke="#E53E3E" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center">No salary data available</p>
          )}
        </div>
      </div>

      {/* Job Listings */}
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-10 mt-8 space-y-6">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Latest Job Market Trends</h2>

        {loading && (
          <div className="text-center text-gray-600">
            <p>Loading job trends...</p>
          </div>
        )}

        {!loading && trends.length === 0 && (
          <p className="text-gray-500 text-center">No trends available. Try a different search.</p>
        )}

        <div className="space-y-6">
          {trends.map((trend, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900">{trend.title}</h3>
              <p className="text-gray-700 mt-2">{trend.company.display_name}</p>
              <p className="text-gray-500">
                {trend.location.display_name} • ${trend.salary_min || "N/A"} - ${trend.salary_max || "N/A"}
              </p>
              <a
                href={trend.redirect_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-3 text-blue-600 font-semibold hover:underline"
              >
                View More
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
