"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabase';

export default function Recommendations() {
  const API_KEY = "28861c5339msh90e89ca9d340422p1e26b3jsn5059155d06a0"; 
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [savedCareers, setSavedCareers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }
      setUser(user);

      // Fetch user profile and skills
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profile);

      // Fetch saved careers if you have a saved_careers table
      const { data: savedData, error: savedError } = await supabase
        .from('user_career_preferences')
        .select('saved_careers')
        .eq('user_id', user.id)
        .single();

      if (!savedError && savedData) {
        setSavedCareers(savedData.saved_careers || []);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setError(error.message);
    }
  };

  // Fetch job recommendations from JSearch API
  useEffect(() => {
    if (user && userProfile?.skills?.length > 0) {
      setLoading(true);
      const fetchRecommendations = async () => {
        try {
          const skillQuery = userProfile.skills.join(" ");
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
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchRecommendations();
    }
  }, [userProfile, user]);

  const handleSave = async (career) => {
    try {
      if (!user) return;

      const newSavedCareers = [...savedCareers, career.job_title];
      
      // Update the saved careers in the database
      const { error: updateError } = await supabase
        .from('user_career_preferences')
        .upsert({
          user_id: user.id,
          saved_careers: newSavedCareers,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;
      setSavedCareers(newSavedCareers);
    } catch (error) {
      console.error('Error saving career:', error);
      setError(error.message);
    }
  };

  return (
    <div className="relative bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-black text-white py-20 text-center z-20 relative">
        <h1 className="text-5xl font-extrabold uppercase tracking-wide">
          Career <span className="text-red-400">Recommendations</span>
        </h1>
      </header>

      {/* Content Wrapper */}
      <div className={`relative ${!user ? "blur-sm" : ""}`}>
        {/* Recommendations Section */}
        <section className="max-w-6xl mx-auto py-16 px-6">
          <h2 className="text-3xl font-semibold text-gray-900 text-center">
            Your Personalized Career Matches
          </h2>
          <p className="text-lg text-gray-700 mt-4 text-center">
            Based on your skills: {userProfile?.skills?.join(", ")}
          </p>

          {error && (
            <div className="text-center text-red-600 mt-6 p-4 bg-red-50 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-center text-gray-600 mt-6">Loading recommendations...</p>
          ) : recommendations.length > 0 ? (
            <div className="mt-8 space-y-6">
              {recommendations.map((career, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-900">{career.job_title}</h3>
                  <p className="text-gray-700 mt-2">
                    🏢 Company: <span className="font-bold">{career.employer_name}</span>
                  </p>
                  <p className="text-gray-700 mt-2">
                    📍 Location: {career.job_city}, {career.job_country}
                  </p>
                  <p className="text-gray-700 mt-2">
                    💰 Salary: {career.job_min_salary ? `$${career.job_min_salary} - $${career.job_max_salary}` : "Not listed"}
                  </p>
                  <a 
                    href={career.job_apply_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block mt-2"
                  >
                    View Job Details
                  </a>
                  <button
                    onClick={() => handleSave(career)}
                    disabled={savedCareers.includes(career.job_title)}
                    className={`mt-4 px-4 py-2 rounded-lg font-semibold transition ${
                      savedCareers.includes(career.job_title)
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  >
                    {savedCareers.includes(career.job_title) ? "Saved" : "Save Career"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 mt-6">
              No matching careers found based on your skills.
            </p>
          )}
        </section>

        {/* Saved Recommendations */}
        {savedCareers.length > 0 && (
          <section className="max-w-6xl mx-auto py-16 px-6">
            <h2 className="text-3xl font-semibold text-gray-900 text-center">
              Saved Recommendations
            </h2>
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

      {/* Sign-In Popup Modal */}
      {!user && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center w-96 z-30">
            <h2 className="text-2xl font-bold text-gray-900">Sign In Required</h2>
            <p className="text-gray-600 mt-2">
              Please sign in to view your recommendations.
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="mt-4 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold uppercase tracking-wider hover:bg-red-600 transition"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

