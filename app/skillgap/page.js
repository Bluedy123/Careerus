'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SkillGapChecker() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState('');
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
      // Fetch required skills for selected career
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Skill Gap Analysis
          </h1>
          <p className="mt-2 text-gray-600">
            Compare your current skills with career requirements
          </p>
        </div>

        {/* Career Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Target Career</h2>
          <select
            value={selectedCareer}
            onChange={(e) => handleCareerSelect(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select a career path</option>
            {careers.map(career => (
              <option key={career.career_id} value={career.career_id}>
                {career.title}
              </option>
            ))}
          </select>
        </div>

        {/* Current Skills */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Current Skills</h2>
          <div className="flex flex-wrap gap-2">
            {userSkills.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Gap Analysis Results */}
        {gapAnalysis && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Gap Analysis Results</h2>
            
            {/* Match Percentage */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span>Skills Match</span>
                <span>{gapAnalysis.matchPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2"
                  style={{ width: `${gapAnalysis.matchPercentage}%` }}
                />
              </div>
            </div>

            {/* Matching Skills */}
            <div className="mb-6">
              <h3 className="font-medium text-green-600 mb-2">Matching Skills</h3>
              <div className="flex flex-wrap gap-2">
                {gapAnalysis.matching.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div>
              <h3 className="font-medium text-red-600 mb-2">Skills to Develop</h3>
              <div className="flex flex-wrap gap-2">
                {gapAnalysis.missing.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 text-red-500 p-3 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}