'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Skill categories and options
const skillCategories = {
  'Technical': [
    'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Java', 'C++', 'AWS', 
    'Azure', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Analysis'
  ],
  'Soft Skills': [
    'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Critical Thinking',
    'Time Management', 'Adaptability', 'Creativity', 'Emotional Intelligence'
  ],
  'Business': [
    'Project Management', 'Marketing', 'Sales', 'Finance', 'Accounting', 
    'Business Strategy', 'Customer Relations', 'Operations', 'Human Resources'
  ],
  'Design': [
    'UI/UX Design', 'Graphic Design', 'Web Design', 'Product Design', 
    'Wireframing', 'Prototyping', 'Typography', 'Adobe Creative Suite'
  ]
};

const proficiencyLevels = [
  { value: 'beginner', label: 'Beginner', color: 'bg-blue-100 text-blue-800' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-green-100 text-green-800' },
  { value: 'advanced', label: 'Advanced', color: 'bg-purple-100 text-purple-800' },
  { value: 'expert', label: 'Expert', color: 'bg-red-100 text-red-800' }
];

export default function SkillsManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingSkills, setSavingSkills] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [user, setUser] = useState(null);
  const [userSkills, setUserSkills] = useState({});
  const [customSkill, setCustomSkill] = useState('');
  const [customSkillCategory, setCustomSkillCategory] = useState('Technical');
  const [customSkillProficiency, setCustomSkillProficiency] = useState('beginner');
  const [activeCategory, setActiveCategory] = useState('Technical');

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
      await fetchUserSkills(user.id);
    } catch (error) {
      console.error('Error checking auth:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSkills = async (userId) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('skills, skills_proficiency')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      // Convert the array structure to map for easier handling
      const skillsMap = {};
      
      // Handle if profile.skills_proficiency is null or not yet initialized
      const skillsArray = profile.skills || [];
      const proficiencyData = profile.skills_proficiency || {};

      skillsArray.forEach(skill => {
        skillsMap[skill] = proficiencyData[skill] || 'beginner';
      });
      
      setUserSkills(skillsMap);
    } catch (error) {
      console.error('Error fetching skills:', error);
      setError(error.message);
    }
  };

  const toggleSkill = (skill, proficiency = 'beginner') => {
    setUserSkills(prevSkills => {
      const newSkills = { ...prevSkills };
      
      // If skill exists, remove it, otherwise add it
      if (newSkills[skill]) {
        delete newSkills[skill];
      } else {
        newSkills[skill] = proficiency;
      }
      
      return newSkills;
    });
  };

  const updateSkillProficiency = (skill, proficiency) => {
    setUserSkills(prevSkills => ({
      ...prevSkills,
      [skill]: proficiency
    }));
  };

  const handleAddCustomSkill = () => {
    if (!customSkill.trim()) return;
    
    toggleSkill(customSkill, customSkillProficiency);
    setCustomSkill('');
  };

  const saveSkills = async () => {
    try {
      setSavingSkills(true);
      setError(null);
      setSuccess(null);

      // Convert from {skill: proficiency} map to skills array and proficiency object
      const skillsArray = Object.keys(userSkills);
      const proficiencyObject = { ...userSkills };

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          skills: skillsArray,
          skills_proficiency: proficiencyObject,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      
      setSuccess('Skills saved successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving skills:', error);
      setError(error.message);
    } finally {
      setSavingSkills(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading skills...</div>
      </div>
    );
  }

  const isSkillSelected = (skill) => Object.keys(userSkills).includes(skill);
  const getSkillProficiency = (skill) => userSkills[skill] || 'beginner';
  const getProficiencyLabel = (level) => proficiencyLevels.find(p => p.value === level)?.label || 'Beginner';
  const getProficiencyColor = (level) => proficiencyLevels.find(p => p.value === level)?.color || 'bg-blue-100 text-blue-800';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-black text-white py-20 text-center">
        <h1 className="text-5xl font-extrabold uppercase tracking-wide">
          Manage <span className="text-red-400">Skills</span>
        </h1>
        <p className="text-lg mt-4 text-gray-300 max-w-3xl mx-auto">
          Add and manage your skills to get personalized career recommendations.
        </p>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Navigation */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-2">
          <Link href="/profile">
            <span className="text-gray-500 hover:text-gray-700">Profile</span>
          </Link>
          <span className="text-gray-500">/</span>
          <span className="text-gray-800 font-medium">Skills Management</span>
        </div>

        {/* Skills Overview */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Skills</h2>
          
          {Object.keys(userSkills).length === 0 ? (
            <p className="text-gray-500 italic">No skills added yet. Start adding skills below.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(userSkills).map(([skill, proficiency]) => (
                <div 
                  key={skill}
                  className={`${getProficiencyColor(proficiency)} px-3 py-1.5 rounded-full inline-flex items-center`}
                >
                  <span>{skill}</span>
                  <span className="text-xs ml-2 bg-white bg-opacity-30 px-1.5 py-0.5 rounded">
                    {getProficiencyLabel(proficiency)}
                  </span>
                  <button 
                    onClick={() => toggleSkill(skill)}
                    className="ml-2 text-gray-700 hover:text-red-500"
                    aria-label="Remove skill"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded mb-4">
              {success}
            </div>
          )}

          <button
            onClick={saveSkills}
            disabled={savingSkills}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {savingSkills ? 'Saving...' : 'Save Skills'}
          </button>
        </div>

        {/* Add Custom Skill */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Custom Skill</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded"
                placeholder="Enter a skill name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={customSkillCategory}
                onChange={(e) => setCustomSkillCategory(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded"
              >
                {Object.keys(skillCategories).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency</label>
              <select
                value={customSkillProficiency}
                onChange={(e) => setCustomSkillProficiency(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded"
              >
                {proficiencyLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleAddCustomSkill}
            disabled={!customSkill.trim()}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-300"
          >
            Add Skill
          </button>
        </div>

        {/* Skill Categories */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse Skills by Category</h2>
          
          {/* Category Tabs */}
          <div className="flex overflow-x-auto space-x-2 pb-2 mb-4">
            {Object.keys(skillCategories).map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  activeCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Skills in Category */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-lg mb-3">{activeCategory} Skills</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {skillCategories[activeCategory].map(skill => (
                <div 
                  key={skill}
                  className={`p-3 rounded-lg border ${
                    isSkillSelected(skill) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`skill-${skill}`}
                        checked={isSkillSelected(skill)}
                        onChange={() => toggleSkill(skill, getSkillProficiency(skill))}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label htmlFor={`skill-${skill}`} className="ml-2 text-gray-800">
                        {skill}
                      </label>
                    </div>
                    
                    {isSkillSelected(skill) && (
                      <select
                        value={getSkillProficiency(skill)}
                        onChange={(e) => updateSkillProficiency(skill, e.target.value)}
                        className="text-xs p-1 border border-gray-300 rounded bg-white"
                      >
                        {proficiencyLevels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
