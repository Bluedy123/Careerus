'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Industry options
const industryOptions = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Construction', 'Hospitality', 'Entertainment', 'Marketing',
  'Consulting', 'Government', 'Non-profit', 'Energy', 'Transportation'
];

// Job type options
const jobTypeOptions = [
  'Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'
];

// Location type options
const locationTypeOptions = [
  'On-site', 'Remote', 'Hybrid'
];

// Company size options
const companySizeOptions = [
  'Startup (1-10)', 'Small (11-50)', 'Medium (51-200)', 
  'Large (201-1000)', 'Enterprise (1000+)'
];

export default function CareerPreferences() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [user, setUser] = useState(null);
  
  const [preferences, setPreferences] = useState({
    desired_industries: [],
    desired_job_types: [],
    desired_locations: [],
    desired_location_types: [],
    desired_company_sizes: [],
    min_salary: '',
    relocation_willingness: false,
    travel_willingness: 0, // 0-100%
    career_goals: '',
    desired_benefits: []
  });

  // Benefits options with icons
  const benefitsOptions = [
    { id: 'health_insurance', label: 'Health Insurance', icon: '🏥' },
    { id: 'dental_vision', label: 'Dental & Vision', icon: '👁️' },
    { id: 'retirement', label: '401(k)/Retirement', icon: '💰' },
    { id: 'paid_time_off', label: 'Paid Time Off', icon: '🏖️' },
    { id: 'parental_leave', label: 'Parental Leave', icon: '👶' },
    { id: 'remote_work', label: 'Remote Work', icon: '🏠' },
    { id: 'flexible_hours', label: 'Flexible Hours', icon: '⏰' },
    { id: 'professional_development', label: 'Professional Development', icon: '📚' },
    { id: 'gym_wellness', label: 'Gym/Wellness', icon: '💪' },
    { id: 'stock_options', label: 'Stock Options', icon: '📈' }
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      await fetchPreferences(user.id);
    } catch (error) {
      console.error('Error checking auth:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_career_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is fine for new users
        throw error;
      }

      if (data) {
        setPreferences({
          desired_industries: data.desired_industries || [],
          desired_job_types: data.desired_job_types || [],
          desired_locations: data.desired_locations || [],
          desired_location_types: data.desired_location_types || [],
          desired_company_sizes: data.desired_company_sizes || [],
          min_salary: data.min_salary || '',
          relocation_willingness: data.relocation_willingness || false,
          travel_willingness: data.travel_willingness || 0,
          career_goals: data.career_goals || '',
          desired_benefits: data.desired_benefits || []
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setError(error.message);
    }
  };

  const handleArrayToggle = (field, value) => {
    setPreferences(prev => {
      const array = [...prev[field]];
      const index = array.indexOf(value);
      
      if (index > -1) {
        array.splice(index, 1);
      } else {
        array.push(value);
      }
      
      return { ...prev, [field]: array };
    });
  };

  const handleBenefitToggle = (benefitId) => {
    handleArrayToggle('desired_benefits', benefitId);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from('user_career_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' } // conflict target now correctly references a unique column
      );

      if (error) throw error;
      
      setSuccess('Career preferences saved successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-black text-white py-20 text-center">
        <h1 className="text-5xl font-extrabold uppercase tracking-wide">
          Career <span className="text-red-400">Preferences</span>
        </h1>
        <p className="text-lg mt-4 text-gray-300 max-w-3xl mx-auto">
          Tell us what you're looking for in your ideal career
        </p>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Navigation */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-2">
          <Link href="/profile">
            <span className="text-gray-500 hover:text-gray-700">Profile</span>
          </Link>
          <span className="text-gray-500">/</span>
          <span className="text-gray-800 font-medium">Career Preferences</span>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded">
            {success}
          </div>
        )}

        {/* Industry Preferences */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Desired Industries</h2>
          <p className="text-gray-600 mb-4">Select the industries you're interested in working in.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {industryOptions.map(industry => (
              <button
                key={industry}
                onClick={() => handleArrayToggle('desired_industries', industry)}
                className={`p-3 rounded-lg border ${
                  preferences.desired_industries.includes(industry)
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-200 hover:border-blue-500'
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>

        {/* Job Type and Location Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Types */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Types</h2>
            <p className="text-gray-600 mb-4">What type of employment are you looking for?</p>
            
            <div className="space-y-3">
              {jobTypeOptions.map(jobType => (
                <div 
                  key={jobType}
                  className="flex items-center"
                >
                  <input
                    type="checkbox"
                    id={`job-type-${jobType}`}
                    checked={preferences.desired_job_types.includes(jobType)}
                    onChange={() => handleArrayToggle('desired_job_types', jobType)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label htmlFor={`job-type-${jobType}`} className="ml-2 text-gray-800">
                    {jobType}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Work Location Type */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Work Location</h2>
            <p className="text-gray-600 mb-4">What type of work environment do you prefer?</p>
            
            <div className="space-y-3">
              {locationTypeOptions.map(locationType => (
                <div 
                  key={locationType}
                  className="flex items-center"
                >
                  <input
                    type="checkbox"
                    id={`location-type-${locationType}`}
                    checked={preferences.desired_location_types.includes(locationType)}
                    onChange={() => handleArrayToggle('desired_location_types', locationType)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label htmlFor={`location-type-${locationType}`} className="ml-2 text-gray-800">
                    {locationType}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Salary and Company Size */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Salary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Salary Expectations</h2>
            <p className="text-gray-600 mb-4">What's your minimum salary expectation?</p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="min-salary" className="block text-sm font-medium text-gray-700">
                  Minimum Annual Salary ($)
                </label>
                <input
                  type="number"
                  id="min-salary"
                  value={preferences.min_salary}
                  onChange={(e) => setPreferences({...preferences, min_salary: e.target.value})}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g., 50000"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="relocation"
                  checked={preferences.relocation_willingness}
                  onChange={(e) => setPreferences({...preferences, relocation_willingness: e.target.checked})}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="relocation" className="ml-2 text-gray-800">
                  Willing to relocate for the right opportunity
                </label>
              </div>
            </div>
          </div>

          {/* Company Size */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Company Size</h2>
            <p className="text-gray-600 mb-4">What size company would you prefer to work for?</p>
            
            <div className="space-y-3">
              {companySizeOptions.map(size => (
                <div 
                  key={size}
                  className="flex items-center"
                >
                  <input
                    type="checkbox"
                    id={`company-size-${size}`}
                    checked={preferences.desired_company_sizes.includes(size)}
                    onChange={() => handleArrayToggle('desired_company_sizes', size)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label htmlFor={`company-size-${size}`} className="ml-2 text-gray-800">
                    {size}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits and Travel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Benefits */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Important Benefits</h2>
            <p className="text-gray-600 mb-4">Select the benefits that are most important to you.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {benefitsOptions.map(benefit => (
                <div 
                  key={benefit.id}
                  className="flex items-center"
                >
                  <input
                    type="checkbox"
                    id={`benefit-${benefit.id}`}
                    checked={preferences.desired_benefits.includes(benefit.id)}
                    onChange={() => handleBenefitToggle(benefit.id)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label htmlFor={`benefit-${benefit.id}`} className="ml-2 text-gray-800">
                    {benefit.icon} {benefit.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Travel */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Travel Willingness</h2>
            <p className="text-gray-600 mb-4">How much work-related travel are you willing to do?</p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="travel-percentage" className="block text-sm font-medium text-gray-700">
                  Maximum Travel: {preferences.travel_willingness}% of work time
                </label>
                <input
                  type="range"
                  id="travel-percentage"
                  min="0"
                  max="100"
                  step="5"
                  value={preferences.travel_willingness}
                  onChange={(e) => setPreferences({...preferences, travel_willingness: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Career Goals */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Career Goals</h2>
          <p className="text-gray-600 mb-4">Describe your career goals and aspirations.</p>
          
          <textarea
            value={preferences.career_goals}
            onChange={(e) => setPreferences({...preferences, career_goals: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded"
            rows="4"
            placeholder="e.g., I want to become a senior software engineer in the next 3-5 years..."
          ></textarea>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
