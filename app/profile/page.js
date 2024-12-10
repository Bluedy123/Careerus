'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Book, Briefcase, Edit } from 'lucide-react';

export default function ProfileView() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          users!user_id (
            email,
            role
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Validate and parse skills/interests as arrays
      const validatedProfile = {
        ...profileData,
        skills: Array.isArray(profileData.skills) ? profileData.skills : [],
        interests: Array.isArray(profileData.interests) ? profileData.interests : [],
      };
      setProfile(validatedProfile);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Profile not found</p>
          <button
            onClick={() => router.push('/setup-profile')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header Section */}
          <div className="bg-blue-600 p-6 sm:p-8">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="bg-white p-3 rounded-full">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
                <div className="ml-4 text-white">
                  <h1 className="text-2xl font-bold">
                    {profile.full_name}
                  </h1>
                  <p className="text-blue-100">{profile.users?.role}</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/edit-profile')}
                className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 sm:p-8">
            {/* Bio */}
            {profile.bio && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
                <p className="text-gray-600">{profile.bio}</p>
              </div>
            )}

            {/* Education */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Education</h2>
              <div className="flex items-start">
                <Book className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">{profile.education_level}</p>
                  {profile.field_of_study && (
                    <p className="text-gray-600">{profile.field_of_study}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
              <div className="flex items-center text-gray-600">
                <div className="mr-6">
                  <span className="block text-sm text-gray-500">Email</span>
                  <span>{profile.users?.email || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="bg-gray-50 px-6 py-4 sm:px-8">
            <p className="text-sm text-gray-500">
              Profile last updated: {new Date(profile.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}