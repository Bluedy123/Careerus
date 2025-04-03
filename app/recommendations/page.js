"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabase';

// Mock data to be used when API call fails
const mockRecommendations = [
  {
    job_title: "Software Developer",
    employer_name: "Tech Solutions Inc.",
    job_city: "San Francisco",
    job_country: "USA",
    job_min_salary: 80000,
    job_max_salary: 120000,
    job_apply_link: "#"
  },
  {
    job_title: "Data Analyst",
    employer_name: "Data Insights Co.",
    job_city: "New York",
    job_country: "USA",
    job_min_salary: 75000,
    job_max_salary: 95000,
    job_apply_link: "#"
  }
];

export default function Recommendations() {
  const API_KEY = "28861c5339msh90e89ca9d340422p1e26b3jsn5059155d06a0"; 
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [careerPreferences, setCareerPreferences] = useState(null);
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

      // Fetch career preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_career_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!preferencesError && preferencesData) {
        setCareerPreferences(preferencesData);
        setSavedCareers(preferencesData.saved_careers || []);
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
      fetchRecommendations();
    }
  }, [userProfile, careerPreferences, user]);

  const fetchRecommendations = async () => {
    try {
      // Try different search strategies in sequence until we get results
      let results = [];
      
      // Strategy 1: Using skills + primary industry preference (if available)
      if (results.length === 0) {
        const query = buildQueryWithPrimaryPreference();
        console.log("Trying search with skills + primary preference:", query);
        results = await searchJobs(query);
      }
      
      // Strategy 2: Skills only if previous search returned no results
      if (results.length === 0) {
        const skillsOnly = userProfile.skills.join(" ");
        console.log("Trying search with skills only:", skillsOnly);
        results = await searchJobs(skillsOnly);
      }
      
      // Strategy 3: Use general job titles related to user's skills
      if (results.length === 0) {
        const generalQuery = "developer programmer analyst engineer manager " + 
                            (userProfile.skills[0] || "software");
        console.log("Trying search with general terms:", generalQuery);
        results = await searchJobs(generalQuery);
      }
      
      // If we got results, apply preference filtering only if we have enough results
      if (results.length > 0) {
        let filteredResults = [...results];
        
        // Only apply salary filtering if we have enough results
        if (careerPreferences?.min_salary && filteredResults.length > 5) {
          const beforeCount = filteredResults.length;
          filteredResults = filteredResults.filter(job => 
            (job.job_min_salary && job.job_min_salary >= careerPreferences.min_salary) ||
            (job.job_max_salary && job.job_max_salary >= careerPreferences.min_salary)
          );
          console.log(`Salary filter: ${beforeCount} -> ${filteredResults.length} results`);
          
          // Revert filtering if too few results remain
          if (filteredResults.length < 3) {
            console.log("Too few results after salary filtering, reverting");
            filteredResults = results;
          }
        }
        
        // Apply location type filtering only if we have enough results
        if (careerPreferences?.desired_location_types?.length > 0 && filteredResults.length > 5) {
          const beforeCount = filteredResults.length;
          const locationTypes = careerPreferences.desired_location_types.map(type => type.toLowerCase());
          
          const locationFiltered = filteredResults.filter(job => {
            const jobDescription = (job.job_description || "").toLowerCase();
            return locationTypes.some(type => 
              jobDescription.includes(type) || 
              jobDescription.includes("work from home") ||
              jobDescription.includes("wfh")
            );
          });
          
          console.log(`Location type filter: ${beforeCount} -> ${locationFiltered.length} results`);
          
          // Only use location filtering if we still have enough results
          if (locationFiltered.length >= 3) {
            filteredResults = locationFiltered;
          }
        }
        
        setRecommendations(filteredResults);
      } else {
        // If all strategies failed, use mock data
        console.log("All search strategies failed, using mock data");
        setError("Could not find specific matches. Showing sample career options instead.");
        setRecommendations(mockRecommendations);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setError("API limit reached. Showing sample data instead.");
      setRecommendations(mockRecommendations);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to search jobs with a query
  const searchJobs = async (query) => {
    if (!query.trim()) return [];
    
    try {
      const response = await fetch(
        `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": API_KEY,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
          },
        }
      );

      if (!response.ok) {
        console.error("API response not OK:", response.status);
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error in searchJobs:", error);
      return [];
    }
  };
  
  // Build a query with skills and primary industry preference
  const buildQueryWithPrimaryPreference = () => {
    const queryParts = [];
    
    // Add skills to query (most important)
    if (userProfile?.skills?.length > 0) {
      // Take top 3 skills maximum to avoid too specific queries
      const topSkills = userProfile.skills.slice(0, 3);
      queryParts.push(topSkills.join(" "));
    }
    
    // Add only the most important preference to avoid over-filtering
    if (careerPreferences) {
      // Add primary industry if available (only one)
      if (careerPreferences.desired_industries?.length > 0) {
        queryParts.push(careerPreferences.desired_industries[0]);
      }
      
      // Add primary location if available (only one, for specificity)
      if (careerPreferences.desired_locations?.length > 0) {
        queryParts.push("in " + careerPreferences.desired_locations[0]);
      }
    }
    
    return queryParts.join(" ");
  };

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

  const renderPreferencesList = () => {
    if (!careerPreferences) return null;
    
    const preferenceSections = [];
    
    if (careerPreferences.desired_industries?.length > 0) {
      preferenceSections.push(`Industries: ${careerPreferences.desired_industries.join(", ")}`);
    }
    
    if (careerPreferences.desired_job_types?.length > 0) {
      preferenceSections.push(`Job Types: ${careerPreferences.desired_job_types.join(", ")}`);
    }
    
    if (careerPreferences.desired_location_types?.length > 0) {
      preferenceSections.push(`Work Style: ${careerPreferences.desired_location_types.join(", ")}`);
    }
    
    if (careerPreferences.min_salary) {
      preferenceSections.push(`Min Salary: $${careerPreferences.min_salary}`);
    }
    
    return preferenceSections.length > 0 ? (
      <div className="mt-3 bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Your Career Preferences:</h3>
        <ul className="list-disc list-inside space-y-1">
          {preferenceSections.map((pref, index) => (
            <li key={index} className="text-gray-700">{pref}</li>
          ))}
        </ul>
      </div>
    ) : null;
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
          
          <div className="mt-4 text-lg text-gray-700 text-center">
            <p>Based on your skills: {userProfile?.skills?.join(", ")}</p>
            {renderPreferencesList()}
            
            {!careerPreferences && (
              <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-300">
                <p className="text-yellow-800">
                  ⚠️ No career preferences found. 
                  <a href="/careerpreferences" className="underline font-medium ml-1">
                    Set your preferences
                  </a> to get more relevant recommendations.
                </p>
              </div>
            )}
          </div>

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
              No matching careers found based on your skills and preferences.
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

