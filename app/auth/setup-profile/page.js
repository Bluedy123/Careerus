'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const educationLevels = [
  'High School',
  'Some College',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'PhD'
];

const roleOptions = [
  'student',
  'employer',
  'career_changer'
];

const skillOptions = [
  'Programming',
  'Data Analysis',
  'Project Management',
  'Design',
  'Marketing',
  'Communication',
  'Leadership',
  'Research',
  // Add more skills as needed
];

const interestOptions = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Arts',
  'Science',
  'Business',
  'Computer',
  // Add more interests as needed
];

export default function SetupProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  const [profileData, setProfileData] = useState({
    full_name: '',
    bio: '',
    education_level: '',
    field_of_study: '',
    interests: [],
    skills: []
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // First, check if user exists in users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          setError('Error fetching user data');
          return;
        }

        // Then check for profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (profile) {
          router.push('/profile');
        }
      } else {
        router.push('/login');
      }
    };

    checkUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Validation: Ensure required fields are filled
      if (!profileData.full_name) {
        setError('Full name is required.');
        return;
      }

      if (profileData.skills.length === 0) {
        setError('Please select at least one skill.');
        return;
      }

      if (profileData.interests.length === 0) {
        setError('Please select at least one interest.');
        return;
      }

      if (!user) throw new Error('No user found');
      
      // Use upsert to avoid duplicate inserts
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          user_id: user.id,
          email: user.email,
          role: profileData.role,
          created_at: new Date().toISOString()
        });

      if (userError) throw userError;

      // Then create profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          full_name: profileData.full_name,
          bio: profileData.bio,
          education_level: profileData.education_level,
          field_of_study: profileData.field_of_study,
          interests: profileData.interests,
          skills: profileData.skills,
        });

      if (profileError) throw profileError;

      router.push('/profile');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (array, value) => {
    if (array.includes(value)) {
      return array.filter(item => item !== value);
    }
    return [...array, value];
  };
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Complete Your Profile
          </h2>
          {error && (
            <div className="mb-4 bg-red-50 text-red-500 p-3 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={profileData.full_name}
                onChange={(e) => setProfileData({
                  ...profileData,
                  full_name: e.target.value
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                rows="3"
                value={profileData.bio}
                onChange={(e) => setProfileData({
                  ...profileData,
                  bio: e.target.value
                })}
              />
            </div>
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                I am a...
              </label>
              <select
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={profileData.role}
                onChange={(e) => setProfileData({
                  ...profileData,
                  role: e.target.value
                })}
              >
                <option value="">Select role</option>
                {roleOptions.map(role => (
                  <option key={role} value={role}>
                    {role.replace('_', ' ').charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            {/* Education */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Education Level
              </label>
              <select
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={profileData.education_level}
                onChange={(e) => setProfileData({
                  ...profileData,
                  education_level: e.target.value
                })}
              >
                <option value="">Select education level</option>
                {educationLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Field of Study */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Field of Study
              </label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={profileData.field_of_study}
                onChange={(e) => setProfileData({
                  ...profileData,
                  field_of_study: e.target.value
                })}
                placeholder="e.g., Computer Science, Business, etc."
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map(skill => (
                  <button
                    type="button"
                    key={skill}
                    aria-label={`Select skill ${skill}`}
                    onClick={() => setProfileData({
                      ...profileData,
                      skills: toggleSelection(profileData.skills, skill)
                    })}
                    className={`px-3 py-1 rounded-full text-sm ${
                      profileData.skills.includes(skill)
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    } border`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map(interest => (
                  <button
                    type="button"
                    key={interest}
                    aria-label={`Select interest ${interest}`}
                    onClick={() => setProfileData({
                      ...profileData,
                      interests: toggleSelection(profileData.interests, interest)
                    })}
                    className={`px-3 py-1 rounded-full text-sm ${
                      profileData.interests.includes(interest)
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    } border`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}