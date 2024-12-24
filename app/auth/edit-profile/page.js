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

const skillOptions = [
  'Programming',
  'Data Analysis',
  'Project Management',
  'Design',
  'Marketing',
  'Communication',
  'Leadership',
  'Research'
];

const interestOptions = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Arts',
  'Science',
  'Business',
  'Computer'
];

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [profileData, setProfileData] = useState({
    full_name: '',
    bio: '',
    education_level: '',
    field_of_study: '',
    interests: [],
    skills: []
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      setProfileData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        education_level: profile.education_level || '',
        field_of_study: profile.field_of_study || '',
        interests: profile.interests || [],
        skills: profile.skills || []
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (!user) throw new Error('No user found');

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          full_name: profileData.full_name,
          bio: profileData.bio,
          education_level: profileData.education_level,
          field_of_study: profileData.field_of_study,
          interests: profileData.interests,
          skills: profileData.skills,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      router.push('/profile');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError(null);
  
      if (!user) throw new Error('No user found');
  
      // 1. Delete from user_career_preferences
      const { error: preferencesError } = await supabase
        .from('user_career_preferences')
        .delete()
        .eq('user_id', user.id);
  
      if (preferencesError) throw preferencesError;
  
      // 2. Delete from career_recommendations
      const { error: recommendationsError } = await supabase
        .from('career_recommendations')
        .delete()
        .eq('user_id', user.id);
  
      if (recommendationsError) throw recommendationsError;
  
      // 3. Delete from user_skills
      const { error: skillsError } = await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', user.id);
  
      if (skillsError) throw skillsError;
  
      // 4. Delete from user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id);
  
      if (profileError) throw profileError;
  
      // 5. Delete from users table
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('user_id', user.id);
  
        if (userError) throw userError;

        // Call API to delete from Supabase auth
        const response = await fetch('/api/delete-user', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id })
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete authentication data');
        }
    
        // Sign out after successful deletion
        await supabase.auth.signOut();
        router.push('/login');
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
        setShowDeleteConfirm(false);
      }
    };

  const toggleSelection = (array, value) => {
    const index = array.indexOf(value);
    return index > -1 ? array.filter((_, i) => i !== index) : [...array, value];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Edit Profile
            </h2>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700"
            >
              Delete Account
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-500 p-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
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

            {/* Bio */}
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

            {/* Education Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Education Level
              </label>
              <select
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
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Delete Account
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}