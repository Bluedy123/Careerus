'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const studentEducationLevels = [
  'High School',
  'Some College',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'PhD'
];

const studentSkillOptions = [
  'Programming',
  'Data Analysis',
  'Project Management',
  'Design',
  'Marketing',
  'Communication',
  'Leadership',
  'Research',
];

const studentInterestOptions = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Arts',
  'Science',
  'Business',
  'Computer',
];

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [studentData, setStudentData] = useState({
    full_name: '',
    bio: '',
    education_level: '',
    field_of_study: '',
    interests: [],
    skills: []
  });
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

      // Get user role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (userError) throw userError;
      setUserRole(userData.role);

      // Get profile data based on role
      if (userData.role === 'student') {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;
        setStudentData(profile);
      } else {
        const { data: profile, error: profileError } = await supabase
          .from('employer_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;
        setEmployerData(profile);
      }

      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      if (userRole === 'student') {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            ...studentData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else {
        const { error: updateError } = await supabase
          .from('employer_profiles')
          .update({
            ...employerData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      }

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Edit {userRole === 'student' ? 'Student' : 'Employer'} Profile
          </h2>

          {error && (
            <div className="mb-4 bg-red-50 text-red-500 p-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {userRole === 'student' ? (
              // Student Form
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
                    Education Level
                  </label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={studentData.education_level}
                    onChange={(e) => setStudentData({
                      ...studentData,
                      education_level: e.target.value
                    })}
                  >
                    <option value="">Select education level</option>
                    {studentEducationLevels.map(level => (
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

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {studentSkillOptions.map(skill => (
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

                {/* Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interests
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {studentInterestOptions.map(interest => (
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
              // Employer Form
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
                    required
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
                    Company Website
                  </label>
                  <input
                    type="url"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={employerData.website}
                    onChange={(e) => setEmployerData({
                      ...employerData,
                      website: e.target.value
                    })}
                    placeholder="https://"
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

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}