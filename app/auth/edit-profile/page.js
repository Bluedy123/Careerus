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

// Employer Options
const industryOptions = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Construction',
  'Consulting'
];

const companySizeOptions = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501+ employees'
];

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Student profile data
  const [studentData, setStudentData] = useState({
    full_name: '',
    bio: '',
    education_level: '',
    field_of_study: '',
    interests: [],
    skills: []
  });

// Employer profile data
  const [employerData, setEmployerData] = useState({
    company_name: '',
    industry: '',
    company_size: '',
    location: '',
    website: '',
    bio: ''
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

      // Get user role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (userError) throw userError;
      setUserRole(userData.role);

      // Get profile based on role
      if (userData.role === 'student') {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

      if (profileError) throw profileError;

      setStudentData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        education_level: profile.education_level || '',
        field_of_study: profile.field_of_study || '',
        interests: profile.interests || [],
        skills: profile.skills || []
      });
    } else {
      const { data: profile, error: profileError } = await supabase
        .from('employer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setEmployerData({
        company_name: profile.company_name || '',
        industry: profile.industry || '',
        company_size: profile.company_size || '',
        location: profile.location || '',
        website: profile.website || '',
        bio: profile.bio || ''
      });
    }
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

      if (userRole === 'student') {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            ...studentData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (profileError) throw profileError;
      } else {
        const { error: profileError } = await supabase
          .from('employer_profiles')
          .update({
            ...employerData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (profileError) throw profileError;
      }

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
  
      // Delete based on user role
      if (userRole === 'student') {
        // Delete student-related data
        const { error: preferencesError } = await supabase
          .from('user_career_preferences')
          .delete()
          .eq('user_id', user.id);
        if (preferencesError) throw preferencesError;
  
        const { error: recommendationsError } = await supabase
          .from('career_recommendations')
          .delete()
          .eq('user_id', user.id);
        if (recommendationsError) throw recommendationsError;
  
        const { error: profileError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('user_id', user.id);
        if (profileError) throw profileError;
      } else {
        // Delete employer-related data
        // First delete any job listings or applications if they exist
        const { error: employerProfileError } = await supabase
          .from('employer_profiles')
          .delete()
          .eq('user_id', user.id);
        if (employerProfileError) throw employerProfileError;
      }
  
      // Finally delete the user record
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
      console.error('Delete error:', error);
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
              Edit {userRole === 'student' ? 'Student' : 'Employer'} Profile
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
            {userRole === 'student' ? (
              // Student Form Fields
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={studentData.full_name}
                    onChange={(e) => setStudentData({
                      ...studentData,
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
                    value={studentData.bio}
                    onChange={(e) => setStudentData({
                      ...studentData,
                      bio: e.target.value
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Education Level
                  </label>
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={studentData.education_level}
                    onChange={(e) => setStudentData({
                      ...studentData,
                      education_level: e.target.value
                    })}
                  >
                    <option value="">Select education level</option>
                    {educationLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={studentData.field_of_study}
                    onChange={(e) => setStudentData({
                      ...studentData,
                      field_of_study: e.target.value
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map(skill => (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => setStudentData({
                          ...studentData,
                          skills: toggleSelection(studentData.skills, skill)
                        })}
                        className={`px-3 py-1 rounded-full text-sm ${
                          studentData.skills?.includes(skill)
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        } border`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interests
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map(interest => (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => setStudentData({
                          ...studentData,
                          interests: toggleSelection(studentData.interests, interest)
                        })}
                        className={`px-3 py-1 rounded-full text-sm ${
                          studentData.interests?.includes(interest)
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        } border`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              // Employer Form Fields
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={employerData.company_name}
                    onChange={(e) => setEmployerData({
                      ...employerData,
                      company_name: e.target.value
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Industry
                  </label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={employerData.industry}
                    onChange={(e) => setEmployerData({
                      ...employerData,
                      industry: e.target.value
                    })}
                  >
                    <option value="">Select industry</option>
                    {industryOptions.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Company Size
                  </label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={employerData.company_size}
                    onChange={(e) => setEmployerData({
                      ...employerData,
                      company_size: e.target.value
                    })}
                  >
                    <option value="">Select company size</option>
                    {companySizeOptions.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={employerData.location}
                    onChange={(e) => setEmployerData({
                      ...employerData,
                      location: e.target.value
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <input
                    type="url"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={employerData.website}
                    onChange={(e) => setEmployerData({
                      ...employerData,
                      website: e.target.value
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Company Description
                  </label>
                  <textarea
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    rows="4"
                    value={employerData.bio}
                    onChange={(e) => setEmployerData({
                      ...employerData,
                      bio: e.target.value
                    })}
                  />
                </div>
              </>
            )}

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