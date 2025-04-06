"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import debounce from "lodash/debounce";

export default function JobSearch() {
  const router = useRouter();
  const API_KEY = "28861c5339msh90e89ca9d340422p1e26b3jsn5059155d06a0";

  // User and authentication state
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);

  // Search parameters
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [datePosted, setDatePosted] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);

  // Search results and UI state
  const [jobResults, setJobResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // User preferences (for filter suggestions)
  const [userPreferences, setUserPreferences] = useState(null);

  // Get user data on load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch user profile for auto-suggestions
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
          
        setUserProfile(profile);
        
        // Fetch career preferences
        const { data: preferences } = await supabase
          .from("user_career_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single();
          
        if (preferences) {
          setUserPreferences(preferences);
          
          // Auto-populate some filters based on preferences
          if (preferences.desired_locations?.length > 0) {
            setLocation(preferences.desired_locations[0]);
          }
          
          if (preferences.min_salary) {
            setSalaryMin(preferences.min_salary);
          }
          
          // Set remote preference
          if (preferences.desired_location_types?.includes("Remote")) {
            setRemoteOnly(true);
          }
        }
        
        // Fetch saved jobs
        const { data: savedJobsData } = await supabase
          .from("user_career_preferences")
          .select("saved_jobs")
          .eq("user_id", user.id)
          .single();
          
        if (savedJobsData?.saved_jobs) {
          setSavedJobs(savedJobsData.saved_jobs);
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    }
  };
  
  // Perform the job search
  const searchJobs = async (pageNum = 1) => {
    if (!searchQuery && !location) {
      setError("Please enter a search term or location");
      return;
    }
    
    setLoading(true);
    setError(null);
    setPage(pageNum);
    
    try {
      // Build query parameters
      let query = searchQuery;
      
      // Add location if specified
      if (location) {
        query += ` in ${location}`;
      }
      
      // Add job type if specified
      if (jobType) {
        query += ` ${jobType}`;
      }
      
      // Add remote if selected
      if (remoteOnly) {
        query += " remote";
      }
      
      // Experience level
      if (experienceLevel) {
        query += ` ${experienceLevel}`;
      }
      
      // Date posted filter doesn't go in the query string, we'll filter results
      
      // Fetch jobs from API
      const response = await fetch(
        `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${pageNum}&num_pages=1`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": API_KEY,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
          },
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch job listings");
      }
      
      const data = await response.json();
      let results = data.data || [];
      
      // Apply post-fetching filters
      
      // Salary filter
      if (salaryMin) {
        results = results.filter(job => 
          (job.job_min_salary && job.job_min_salary >= parseInt(salaryMin)) ||
          (job.job_max_salary && job.job_max_salary >= parseInt(salaryMin))
        );
      }
      
      // Date posted filter
      if (datePosted) {
        const cutoffDate = new Date();
        
        switch (datePosted) {
          case "today":
            cutoffDate.setDate(cutoffDate.getDate() - 1);
            break;
          case "week":
            cutoffDate.setDate(cutoffDate.getDate() - 7);
            break;
          case "month":
            cutoffDate.setDate(cutoffDate.getDate() - 30);
            break;
        }
        
        results = results.filter(job => {
          if (!job.job_posted_at_datetime_utc) return true;
          const jobDate = new Date(job.job_posted_at_datetime_utc);
          return jobDate >= cutoffDate;
        });
      }
      
      setJobResults(results);
      setTotalPages(data.page_count || 1);
      setSearchPerformed(true);
    } catch (error) {
      console.error("Error searching jobs:", error);
      setError("Failed to search jobs. Please try again later.");
      setJobResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Create a debounced version of search to prevent too many API calls
  const debouncedSearch = useCallback(
    debounce((pageNum) => {
      searchJobs(pageNum);
    }, 500),
    [searchQuery, location, jobType, datePosted, experienceLevel, salaryMin, remoteOnly]
  );
  
  // Handle saving a job
  const handleSaveJob = async (job) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    
    try {
      // Create job object with necessary details
      const jobToSave = {
        job_id: job.job_id,
        job_title: job.job_title,
        employer_name: job.employer_name,
        job_city: job.job_city,
        job_country: job.job_country,
        job_apply_link: job.job_apply_link,
        saved_at: new Date().toISOString()
      };

      if (savedJobs.some(saved => saved.job_id === job.job_id)) return;
      
      // Update local state
      const updatedSavedJobs = [...savedJobs, jobToSave];
      setSavedJobs(updatedSavedJobs);
      
      // Update in database
      await supabase
        .from("user_career_preferences")
        .upsert({
          user_id: user.id,
          saved_jobs: updatedSavedJobs,
          updated_at: new Date().toISOString()
        },{ onConflict: 'user_id' });
    } catch (error) {
      console.error("Error saving job:", error);
      setError("Failed to save job. Please try again.");
    }
  };
  
  // Remove a saved job
  const handleRemoveSaved = async (jobId) => {
    if (!user) return;
    
    try {
      const updatedSavedJobs = savedJobs.filter(job => job.job_id !== jobId);
      setSavedJobs(updatedSavedJobs);
      
      await supabase
        .from("user_career_preferences")
        .upsert({
          user_id: user.id,
          saved_jobs: updatedSavedJobs,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error("Error removing saved job:", error);
    }
  };
  
  // Apply user's skills to search
  const applyUserSkills = () => {
    if (userProfile?.skills?.length > 0) {
      // Take top 3 skills to keep search relevant but not too narrow
      const topSkills = userProfile.skills.slice(0, 3).join(" ");
      setSearchQuery(topSkills);
    }
  };
  
  // Apply user's career preferences
  const applyUserPreferences = () => {
    if (!userPreferences) return;
    
    // Apply industry preference if available
    if (userPreferences.desired_industries?.length > 0) {
      setSearchQuery(userPreferences.desired_industries[0]);
    }
    
    // Apply location preference
    if (userPreferences.desired_locations?.length > 0) {
      setLocation(userPreferences.desired_locations[0]);
    }
    
    // Apply job type preference
    if (userPreferences.desired_job_types?.length > 0) {
      setJobType(userPreferences.desired_job_types[0]);
    }
    
    // Apply remote preference
    if (userPreferences.desired_location_types?.includes("Remote")) {
      setRemoteOnly(true);
    }
    
    // Apply salary preference
    if (userPreferences.min_salary) {
      setSalaryMin(userPreferences.min_salary);
    }
  };
  
  // Check if a job is saved
  const isJobSaved = (jobId) => {
    return savedJobs.some(job => job.job_id === jobId);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-black text-white py-20 text-center">
        <h1 className="text-5xl font-extrabold uppercase tracking-wide">
          Job <span className="text-red-400">Search</span>
        </h1>
        <p className="text-lg mt-4 text-gray-300 max-w-3xl mx-auto">
          Find the perfect opportunity that matches your skills and preferences.
        </p>
      </header>

      {/* Search Container */}
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          {/* Search Form */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Find Your Next Job</h2>
              <div className="space-x-2">
                <button
                  onClick={applyUserSkills}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Use My Skills
                </button>
                <button
                  onClick={applyUserPreferences}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Use My Preferences
                </button>
              </div>
            </div>
            
            {/* Main Search Controls */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Keywords / Job Title
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  placeholder="e.g. Software Engineer, Marketing, etc."
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  placeholder="e.g. New York, Remote, etc."
                />
              </div>
              
              <div>
                <button
                  onClick={() => searchJobs(1)}
                  className="mt-7 w-full bg-red-500 text-white py-2 px-4 rounded-md shadow hover:bg-red-600 transition"
                >
                  Search Jobs
                </button>
              </div>
            </div>
            
            {/* Advanced Filters */}
            <div className="mt-6">
              <button
                type="button"
                className="flex items-center text-blue-600 hover:text-blue-800"
                onClick={() => document.getElementById('filters').classList.toggle('hidden')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                Advanced Filters
              </button>
              
              <div id="filters" className="hidden mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="jobType" className="block text-sm font-medium text-gray-700">
                    Job Type
                  </label>
                  <select
                    id="jobType"
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="">Any Type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="datePosted" className="block text-sm font-medium text-gray-700">
                    Date Posted
                  </label>
                  <select
                    id="datePosted"
                    value={datePosted}
                    onChange={(e) => setDatePosted(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="">Any Time</option>
                    <option value="today">Today</option>
                    <option value="week">Past Week</option>
                    <option value="month">Past Month</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700">
                    Experience Level
                  </label>
                  <select
                    id="experienceLevel"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="">Any Level</option>
                    <option value="entry level">Entry Level</option>
                    <option value="mid level">Mid Level</option>
                    <option value="senior level">Senior Level</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                    Minimum Salary
                  </label>
                  <input
                    type="number"
                    id="salary"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="e.g. 50000"
                  />
                </div>
                
                <div className="col-span-full">
                  <div className="flex items-center">
                    <input
                      id="remoteOnly"
                      type="checkbox"
                      checked={remoteOnly}
                      onChange={(e) => setRemoteOnly(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="remoteOnly" className="ml-2 block text-sm text-gray-700">
                      Remote jobs only
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Search Results */}
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              </div>
            ) : searchPerformed && jobResults.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-xl font-medium text-gray-700">No results found</h3>
                <p className="mt-2 text-gray-500">Try adjusting your search criteria</p>
              </div>
            ) : (
              <>
                {searchPerformed && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {jobResults.length} jobs found
                    </h3>
                  </div>
                )}
                
                <div className="space-y-6">
                  {jobResults.map((job) => (
                    <div key={job.job_id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition p-6">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-bold text-gray-900">{job.job_title}</h3>
                        <div>
                          {isJobSaved(job.job_id) ? (
                            <button
                              onClick={() => handleRemoveSaved(job.job_id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSaveJob(job)}
                              className="text-gray-400 hover:text-blue-500"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-gray-700">
                          <span className="font-medium">{job.employer_name}</span>
                          {job.job_city && job.job_country && (
                            <span> • {job.job_city}, {job.job_country}</span>
                          )}
                        </p>
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          {job.job_employment_type && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {job.job_employment_type}
                            </span>
                          )}
                          
                          {job.job_is_remote && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Remote
                            </span>
                          )}
                          
                          {job.job_min_salary && job.job_max_salary && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                              ${job.job_min_salary.toLocaleString()} - ${job.job_max_salary.toLocaleString()}
                            </span>
                          )}
                          
                          {job.job_posted_at_datetime_utc && (
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                              Posted {new Date(job.job_posted_at_datetime_utc).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        
                        {job.job_description && (
                          <p className="mt-3 text-gray-600 line-clamp-2">
                            {job.job_description.substring(0, 200)}...
                          </p>
                        )}
                        
                        <div className="mt-4 flex justify-end">
                          <a
                            href={job.job_apply_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                          >
                            View Job
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {searchPerformed && totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="inline-flex rounded-md shadow">
                      <button
                        onClick={() => searchJobs(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      
                      <span className="relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700">
                        Page {page} of {totalPages}
                      </span>
                      
                      <button
                        onClick={() => searchJobs(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Saved Jobs Section */}
        {user && savedJobs.length > 0 && (
          <div className="mt-10 bg-white shadow-xl rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">Saved Jobs</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {savedJobs.map((job) => (
                  <div key={job.job_id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{job.job_title}</h3>
                      <p className="text-gray-600">{job.employer_name}</p>
                      {job.job_city && job.job_country && (
                        <p className="text-gray-500 text-sm">{job.job_city}, {job.job_country}</p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <a
                        href={job.job_apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                      >
                        View
                      </a>
                      
                      <button
                        onClick={() => handleRemoveSaved(job.job_id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
