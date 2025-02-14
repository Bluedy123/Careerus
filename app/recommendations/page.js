"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Recommendations() {
  const API_KEY = "28861c5339msh90e89ca9d340422p1e26b3jsn5059155d06a0"; 
  const router = useRouter();

  // Get login state (now properly stored and retrieved)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userSkills, setUserSkills] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [savedCareers, setSavedCareers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check login state from localStorage on first load
  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    if (storedLoginStatus === "true") {
      setIsLoggedIn(true);
    }
    setCheckingAuth(false); // Finish auth check
  }, []);

  const handleLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  // Fetch user's skills (Replace with API call in production)
  useEffect(() => {
    if (isLoggedIn) {
      setUserSkills(["JavaScript", "React", "Python"]);
    }
  }, [isLoggedIn]);

  // Fetch job recommendations from JSearch API
  useEffect(() => {
    if (isLoggedIn && userSkills.length > 0) {
      setLoading(true);
      const fetchRecommendations = async () => {
        try {
          const skillQuery = userSkills.join(" ");
          const response = await fetch(
            `https://jsearch.p.rapidapi.com/search?query=${skillQuery}&page=1&num_pages=1`,
            {
              method: "GET",
              headers: {
                "X-RapidAPI-Key": API_KEY,
                "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
              },
            }
          );

          if (!response.ok) throw new Error("Failed to fetch recommendations");

          const data = await response.json();
          setRecommendations(data.data || []);
        } catch (error) {
          console.error("Error fetching recommendations:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchRecommendations();
    }
  }, [userSkills, isLoggedIn]);

  const handleSave = (career) => {
    if (!savedCareers.includes(career.job_title)) {
      setSavedCareers([...savedCareers, career.job_title]);
    }
  };

  if (checkingAuth) {
    return <div className="min-h-screen flex justify-center items-center text-gray-700">Checking authentication...</div>;
  }

  return (
    <div className="relative bg-gray-100 min-h-screen">
      {/* Header - Always Visible */}
      <header className="bg-black text-white py-20 text-center z-20 relative">
        <h1 className="text-5xl font-extrabold uppercase tracking-wide">
          Career <span className="text-red-400">Recommendations</span>
        </h1>
      </header>

      {/* Content Wrapper (Blurred if Not Logged In) */}
      <div className={`relative ${!isLoggedIn ? "blur-sm" : ""}`}>
        {/* Recommendations Section */}
        <section className="max-w-6xl mx-auto py-16 px-6">
          <h2 className="text-3xl font-semibold text-gray-900 text-center">Your Personalized Career Matches</h2>
          <p className="text-lg text-gray-700 mt-4 text-center">
            Based on your skills, these careers are a strong match for you.
          </p>

          {loading ? (
            <p className="text-center text-gray-600 mt-6">Loading recommendations...</p>
          ) : recommendations.length > 0 ? (
            <div className="mt-8 space-y-6">
              {recommendations.map((career, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-900">{career.job_title}</h3>
                  <p className="text-gray-700 mt-2">🏢 Company: <span className="font-bold">{career.employer_name}</span></p>
                  <p className="text-gray-700 mt-2">📍 Location: {career.job_city}, {career.job_country}</p>
                  <p className="text-gray-700 mt-2">💰 Salary: {career.job_min_salary ? `$${career.job_min_salary} - $${career.job_max_salary}` : "Not listed"}</p>
                  <a href={career.job_apply_link} target="_blank" className="text-blue-600 hover:underline block mt-2">
                    View Job Details
                  </a>
                  <button
                    onClick={() => handleSave(career)}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
                  >
                    Save Career
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 mt-6">No matching careers found based on your skills.</p>
          )}
        </section>

        {/* Saved Recommendations */}
        {savedCareers.length > 0 && (
          <section className="max-w-6xl mx-auto py-16 px-6">
            <h2 className="text-3xl font-semibold text-gray-900 text-center">Saved Recommendations</h2>
            <div className="mt-8 space-y-4">
              {savedCareers.map((career, index) => (
                <div key={index} className="bg-gray-200 p-4 rounded-lg text-gray-900 font-semibold text-center">
                  {career}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sign-In Popup Modal (Fixed) */}
      {!isLoggedIn && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center w-96 z-30">
            <h2 className="text-2xl font-bold text-gray-900">Sign In Required</h2>
            <p className="text-gray-600 mt-2">Please sign in to view your recommendations.</p>
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
