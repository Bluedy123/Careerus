'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const roleOptions = [
  'student',
  'employer'
];

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

export default function SetupProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');

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
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);

        // Check for existing profiles
        const { data: studentProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        const { data: employerProfile } = await supabase
          .from('employer_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (studentProfile || employerProfile) {
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

      if (!user) throw new Error('No user found');

      // First, update user role in users table
      const { error: userCreateError } = await supabase
        .from('users')
        .insert([{
          user_id: user.id,
          email: user.email,
          role: selectedRole,
          created_at: new Date().toISOString(),
          password_hash: 'hashed' // Since auth is handled by Supabase
        }]);

      if (userCreateError) throw userCreateError;

      if (selectedRole === 'student') {
        // Create student profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            user_id: user.id,
            ...studentData
          }]);

        if (profileError) throw profileError;
      } else {
        // Create employer profile
        const { error: employerError } = await supabase
          .from('employer_profiles')
          .insert([{
            user_id: user.id,
            ...employerData
          }]);

        if (employerError) throw employerError;
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

  // Role selection view
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Select Your Role</h2>
          <div className="space-y-4">
            {roleOptions.map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className="w-full p-4 text-left border rounded-lg hover:border-blue-500 focus:outline-none focus:border-blue-500"
              >
                <div className="font-medium">{role.charAt(0).toUpperCase() + role.slice(1)}</div>
                <div className="text-sm text-gray-500">
                  {role === 'student' 
                    ? 'Looking for career opportunities and guidance'
                    : 'Hiring and looking for talent'
                  }
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedRole === 'student' ? 'Complete Student Profile' : 'Complete Employer Profile'}
          </h2>

          {error && (
            <div className="mb-4 bg-red-50 text-red-500 p-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {selectedRole === 'student' ? (
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
                          studentData.skills.includes(skill)
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
                    {studentInterestOptions.map(interest => (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => setStudentData({
                          ...studentData,
                          interests: toggleSelection(studentData.interests, interest)
                        })}
                        className={`px-3 py-1 rounded-full text-sm ${
                          studentData.interests.includes(interest)
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