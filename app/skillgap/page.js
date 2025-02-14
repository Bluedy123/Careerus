"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SkillGapChecker() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState("");
  const [careerSkills, setCareerSkills] = useState([]);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [careers, setCareers] = useState([]);

  useEffect(() => {
    checkAuth();
    fetchCareers();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setUser(user);
    // Fetch user's current skills
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('skills')
      .eq('user_id', user.id)
      .single();
    
    if (profile) {
      setUserSkills(profile.skills || []);
    }
  };

  const fetchCareers = async () => {
    const { data, error } = await supabase
      .from('career_paths')
      .select('*');
    
    if (error) {
      setError(error.message);
      return;
    }
    setCareers(data);
  };

  const handleCareerSelect = async (careerId) => {
    setLoading(true);
    setSelectedCareer(careerId);

    try {
      const { data, error } = await supabase
        .from('career_paths')
        .select('required_skills')
        .eq('career_id', careerId)
        .single();

      if (error) throw error;

      setCareerSkills(data.required_skills || []);
      
      // Calculate skill gap
      const missing = data.required_skills.filter(skill => !userSkills.includes(skill));
      const matching = data.required_skills.filter(skill => userSkills.includes(skill));
      
      setGapAnalysis({
        matching,
        missing,
        matchPercentage: (matching.length / data.required_skills.length) * 100
      });

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-black text-white py-16 text-center">
        <h1 className="text-5xl font-extrabold uppercase tracking-wide">
          Skill Gap <span className="text-red-400">Analysis</span>
        </h1>
        <p className="text-lg text-gray-300 mt-2">
          Bridge the gap between your skills and career goals.
        </p>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-10 mt-8 space-y-8">
        {/* Career Selection & User Skills Box */}
        <div className="bg-gray-50 rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Select Target Career</h2>
          <select
            value={selectedCareer}
            onChange={(e) => handleCareerSelect(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-md shadow-sm text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="" className="text-gray-700">Select a career path</option>
            {careers.map((career) => (
              <option key={career.career_id} value={career.career_id} className="text-black">
                {career.title}
              </option>
            ))}
          </select>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Your Current Skills</h2>
          <div className="flex flex-wrap gap-3">
            {userSkills.length > 0 ? userSkills.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm shadow-sm"
              >
                {skill}
              </span>
            )) : <p className="text-gray-500">No skills added yet.</p>}
          </div>
        </div>

        {/* Gap Analysis Results */}
        {gapAnalysis && (
          <div className="bg-gray-50 rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Gap Analysis Results</h2>

            {/* Match Percentage */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-lg font-semibold">Skills Match</span>
                <span className="text-lg font-semibold">{gapAnalysis.matchPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-3">
                <div
                  className="bg-blue-600 rounded-full h-3"
                  style={{ width: `${gapAnalysis.matchPercentage}%` }}
                />
              </div>
            </div>

            {/* Matching Skills */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-green-600 mb-2">Matching Skills</h3>
              <div className="flex flex-wrap gap-3">
                {gapAnalysis.matching.length > 0 ? gapAnalysis.matching.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm shadow-sm"
                  >
                    {skill}
                  </span>
                )) : <p className="text-gray-500">No matching skills.</p>}
              </div>
            </div>

            {/* Missing Skills */}
            <div>
              <h3 className="text-lg font-medium text-red-600 mb-2">Skills to Develop</h3>
              <div className="flex flex-wrap gap-3">
                {gapAnalysis.missing.length > 0 ? gapAnalysis.missing.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm shadow-sm"
                  >
                    {skill}
                  </span>
                )) : <p className="text-gray-500">No missing skills.</p>}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 text-red-500 p-3 rounded-md shadow-sm">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center mt-4">
            <div className="animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}
