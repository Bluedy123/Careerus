"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";

export default function Dashboard() {
  const router = useRouter();
  
  // State for user data
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [careerPreferences, setCareerPreferences] = useState(null);
  const [userEducation, setUserEducation] = useState('');
  
  // State for analytics data
  const [skillGapData, setSkillGapData] = useState([]);
  const [marketTrends, setMarketTrends] = useState([]);
  const [recommendedPaths, setRecommendedPaths] = useState([]);
  const [skillDemandData, setSkillDemandData] = useState([]);
  const [skillProgressData, setSkillProgressData] = useState([]);
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSectionTab, setActiveSectionTab] = useState('overview');
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4DE6C', '#8884d8'];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If not authenticated, handle later with UI
        setLoading(false);
        return;
      }
      
      setUser(user);
      await fetchUserData(user.id);
      
    } catch (error) {
      console.error('Error checking authentication:', error);
      setError('Error loading dashboard data. Please try again.');
      setLoading(false);
    }
  };

  const fetchUserData = async (userId) => {
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profileError) throw profileError;
      setUserProfile(profile);
      setUserSkills(profile.skills || []);
      setUserEducation(profile.education_level || '');
      
      // Fetch career preferences
      const { data: preferences, error: prefError } = await supabase
        .from('user_career_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!prefError) {
        setCareerPreferences(preferences);
      }
      
      // Generate analytics data
      generateAnalyticsData(profile.skills || [], profile.education_level, preferences);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Error loading profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateAnalyticsData = (skills, education, preferences) => {
    // Generate skill gap data based on common required skills for target careers
    const gapData = generateSkillGapAnalysis(skills, preferences);
    setSkillGapData(gapData);
    
    // Generate market trends based on user skills
    const trendsData = generateMarketTrendsData(skills);
    setMarketTrends(trendsData);
    
    // Generate career path recommendations
    const paths = generateCareerPaths(skills, education, preferences);
    setRecommendedPaths(paths);
    
    // Generate skill demand visualization data
    const demandData = generateSkillDemandData(skills);
    setSkillDemandData(demandData);
    
    // Generate skill progress data (hypothetical for now)
    const progressData = generateSkillProgressData(skills);
    setSkillProgressData(progressData);
  };
  
  // ANALYTICAL DATA GENERATION FUNCTIONS
  
  const generateSkillGapAnalysis = (userSkills, preferences) => {
    // Top in-demand technical skills across industries
    const topTechnicalSkills = [
      "Programming", "Data Analysis", "JavaScript", 
      "Python", "SQL", "Cloud Computing", 
      "Machine Learning", "Project Management"
    ];
    
    // Top soft skills across industries
    const topSoftSkills = [
      "Communication", "Problem Solving", "Teamwork", 
      "Adaptability", "Critical Thinking", "Time Management"
    ];
    
    // Combine all skills
    const allTopSkills = [...topTechnicalSkills, ...topSoftSkills];
    
    // Calculate presence of skills and gaps
    const gapData = allTopSkills.map(skill => {
      const hasSkill = userSkills.includes(skill);
      
      // Determine importance based on target industry if preferences exist
      let importance = 3; // Default medium importance
      if (preferences?.desired_industries?.length > 0) {
        // Adjust importance based on industry preference (simplified)
        const primaryIndustry = preferences.desired_industries[0];
        if (primaryIndustry === "Technology" && topTechnicalSkills.includes(skill)) {
          importance = 5; // Higher importance for tech skills in tech industry
        } else if (primaryIndustry === "Business" && topSoftSkills.includes(skill)) {
          importance = 4; // Higher importance for soft skills in business
        }
      }
      
      return {
        name: skill,
        hasSkill: hasSkill ? 1 : 0,
        gapValue: hasSkill ? 0 : importance, // Gap value is higher for more important missing skills
        importance: importance
      };
    });
    
    // Sort by gap value descending (most critical gaps first)
    return gapData.sort((a, b) => b.gapValue - a.gapValue);
  };
  
  const generateMarketTrendsData = (userSkills) => {
    // Simulate market trend data for the user's skills
    // (if serious, find way to come from an API or database)
    const trendsData = [];
    
    // Generate growth data for each user skill (simulated)
    userSkills.forEach(skill => {
      // Randomize growth between 1-15%
      const growthRate = Math.floor(Math.random() * 15) + 1;
      
      // Determine demand level based on skill type
      let demandLevel = "Medium";
      if (["Programming", "Data Analysis", "Machine Learning", "Cloud Computing"].includes(skill)) {
        demandLevel = "High";
      } else if (["Communication", "Leadership"].includes(skill)) {
        demandLevel = "High";
      }
      
      // Simulate salary range based on skill
      let salaryImpact = "$5,000 - $10,000";
      if (["Programming", "Machine Learning", "Leadership", "Data Analysis"].includes(skill)) {
        salaryImpact = "$10,000 - $20,000";
      }
      
      // Add trend data
      trendsData.push({
        skill: skill,
        growthRate: growthRate,
        demandLevel: demandLevel,
        salaryImpact: salaryImpact
      });
    });
    
    // Sort by growth rate descending
    return trendsData.sort((a, b) => b.growthRate - a.growthRate);
  };
  
  const generateCareerPaths = (userSkills, education, preferences) => {
    // Define potential career paths based on skills and education
    let possiblePaths = [];
    
    // Check for technical skills
    const hasTechnicalSkills = userSkills.some(skill => 
      ["Programming", "Data Analysis", "JavaScript", "Python"].includes(skill)
    );
    
    // Check for management/leadership skills
    const hasLeadershipSkills = userSkills.some(skill => 
      ["Leadership", "Project Management", "Communication"].includes(skill)
    );
    
    // Check for creative skills
    const hasCreativeSkills = userSkills.some(skill => 
      ["Design", "Writing", "Creativity"].includes(skill)
    );
    
    // Add potential career paths based on skill combinations
    if (hasTechnicalSkills) {
      possiblePaths.push({
        name: "Software Development",
        match: 85,
        salary: "$75,000 - $120,000",
        growth: "14% (Faster than average)",
        education: "Bachelor's degree typically required",
        nextSteps: ["Learn modern frameworks", "Build portfolio projects", "Network with developers"]
      });
      
      possiblePaths.push({
        name: "Data Science",
        match: 80,
        salary: "$90,000 - $140,000",
        growth: "22% (Much faster than average)",
        education: "Master's degree often preferred",
        nextSteps: ["Expand machine learning skills", "Practice with real datasets", "Learn data visualization"]
      });
    }
    
    if (hasLeadershipSkills) {
      possiblePaths.push({
        name: "Project Management",
        match: 75,
        salary: "$65,000 - $110,000",
        growth: "8% (Average)",
        education: "Bachelor's degree + certification",
        nextSteps: ["Get PMP certification", "Lead cross-functional teams", "Develop technical knowledge"]
      });
      
      if (hasTechnicalSkills) {
        possiblePaths.push({
          name: "Technical Product Management",
          match: 90,
          salary: "$85,000 - $130,000",
          growth: "10% (Faster than average)",
          education: "Bachelor's degree + technical experience",
          nextSteps: ["Learn product strategy", "Build wireframing skills", "Understand user research"]
        });
      }
    }
    
    if (hasCreativeSkills) {
      possiblePaths.push({
        name: "UX/UI Design",
        match: 70,
        salary: "$65,000 - $100,000",
        growth: "13% (Faster than average)",
        education: "Bachelor's degree or bootcamp",
        nextSteps: ["Build design portfolio", "Learn user research", "Understand UX principles"]
      });
    }
    
    // Add a general option
    possiblePaths.push({
      name: "Marketing Analytics",
      match: 65,
      salary: "$60,000 - $90,000",
      growth: "10% (Faster than average)",
      education: "Bachelor's degree",
      nextSteps: ["Learn marketing platforms", "Understand SEO/SEM", "Develop analytical skills"]
    });
    
    // Factor in preferences if available
    if (preferences?.desired_industries?.length > 0) {
      // Boost match score for careers that match desired industry
      const primaryIndustry = preferences.desired_industries[0];
      possiblePaths = possiblePaths.map(path => {
        if ((primaryIndustry === "Technology" && ["Software Development", "Data Science", "Technical Product Management"].includes(path.name)) ||
            (primaryIndustry === "Marketing" && path.name === "Marketing Analytics")) {
          return { ...path, match: Math.min(path.match + 10, 100) };
        }
        return path;
      });
    }
    
    // Consider salary preferences
    if (preferences?.min_salary) {
      // Filter out paths that don't meet minimum salary expectations
      const minSalary = parseInt(preferences.min_salary);
      possiblePaths = possiblePaths.filter(path => {
        const minPathSalary = parseInt(path.salary.split(" - ")[0].replace("$", "").replace(",", ""));
        return minPathSalary >= minSalary;
      });
    }
    
    // Sort by match score descending
    return possiblePaths.sort((a, b) => b.match - a.match);
  };
  
  const generateSkillDemandData = (userSkills) => {
    // Generate demand data for user's skills
    
    
    // Sample data structure showing demand by industry for each skill
    const demandData = userSkills.map(skill => {
      const data = {
        skill: skill,
        Technology: Math.floor(Math.random() * 100),
        Healthcare: Math.floor(Math.random() * 100),
        Finance: Math.floor(Math.random() * 100),
        Education: Math.floor(Math.random() * 100),
        Manufacturing: Math.floor(Math.random() * 100)
      };
      
      // Boost demand in likely industries for specific skills
      if (["Programming", "Data Analysis"].includes(skill)) {
        data.Technology = Math.min(data.Technology + 40, 100);
        data.Finance = Math.min(data.Finance + 30, 100);
      } else if (["Communication", "Leadership"].includes(skill)) {
        data.Education = Math.min(data.Education + 30, 100);
        data.Healthcare = Math.min(data.Healthcare + 20, 100);
      }
      
      return data;
    });
    
    return demandData;
  };
  
  const generateSkillProgressData = (userSkills) => {
    // In a real app, this would track user's skill development over time
    
    
    // Generate months for the past year
    const months = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(d.getMonth() - i);
      months.push(d.toLocaleString('default', { month: 'short' }));
    }
    
    // Generate skill count data over time (simulating growth)
    const progressData = months.map((month, index) => {
      // Start with fewer skills and grow over time
      const skillCount = Math.min(Math.floor(index / 2) + 1, userSkills.length);
      
      // Calculate proficiency (increases over time)
      const proficiency = Math.min(30 + (index * 5), 90);
      
      return {
        month: month,
        skillCount: skillCount,
        proficiency: proficiency
      };
    });
    
    return progressData;
  };

  // Process user skills data into categories for pie chart
  const processSkillDataForChart = () => {
    // Define categories
    const categories = [
      { name: 'Technical', skills: ['Programming', 'Data Analysis', 'JavaScript', 'Python', 'SQL'] },
      { name: 'Soft Skills', skills: ['Communication', 'Leadership', 'Teamwork'] },
      { name: 'Industry', skills: [] } // Other skills not in above categories
    ];

    const categoryCounts = categories.map(category => {
      // For the last category (Industry), count skills not in other categories
      if (category.skills.length === 0) {
        const otherCategoriesSkills = categories
          .filter(cat => cat.skills.length > 0)
          .flatMap(cat => cat.skills);
        
        const industrySkills = userSkills.filter(
          skill => !otherCategoriesSkills.includes(skill)
        );
        
        return {
          name: category.name,
          value: industrySkills.length,
        };
      }
      
      // For defined categories, count skills that match
      return {
        name: category.name,
        value: userSkills.filter(skill => 
          category.skills.includes(skill)
        ).length
      };
    });
    
    // Filter out categories with 0 skills
    return categoryCounts.filter(cat => cat.value > 0);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-black text-white py-16 text-center">
        <h1 className="text-5xl font-extrabold uppercase tracking-wide">
          Career <span className="text-red-400">Dashboard</span>
        </h1>
        <p className="text-lg mt-4 text-gray-300 max-w-3xl mx-auto">
          Your personalized career insights and analytics.
        </p>
      </header>
      
      {/* Main Content */}
      <div className={`relative ${!user ? "blur-sm" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Dashboard Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Skills in Portfolio</h3>
              <p className="text-3xl font-bold text-blue-600">{userSkills.length}</p>
              <p className="text-gray-600 mt-2">
                {userSkills.length < 5 ? "Consider adding more skills to improve your profile" : "Good variety of skills in your portfolio"}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Market Match Score</h3>
              <p className="text-3xl font-bold text-green-600">
                {userSkills.length > 0 ? `${Math.min(60 + (userSkills.length * 5), 95)}%` : "N/A"}
              </p>
              <p className="text-gray-600 mt-2">
                How well your skills match current market demands
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Career Growth Potential</h3>
              <p className="text-3xl font-bold text-purple-600">
                {recommendedPaths.length > 0 ? `${recommendedPaths[0].match}%` : "N/A"}
              </p>
              <p className="text-gray-600 mt-2">
                Based on your top career path alignment
              </p>
            </div>
          </div>
          
          {/* Section Navigation Tabs */}
          <div className="flex overflow-x-auto bg-white rounded-lg shadow-md p-1 mb-8">
            <button 
              onClick={() => setActiveSectionTab('overview')}
              className={`px-4 py-2 font-medium rounded-md transition ${
                activeSectionTab === 'overview' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveSectionTab('skill-gap')}
              className={`px-4 py-2 font-medium rounded-md transition ${
                activeSectionTab === 'skill-gap' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Skill Gap Analysis
            </button>
            <button 
              onClick={() => setActiveSectionTab('market-trends')}
              className={`px-4 py-2 font-medium rounded-md transition ${
                activeSectionTab === 'market-trends' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Market Trends
            </button>
            <button 
              onClick={() => setActiveSectionTab('career-paths')}
              className={`px-4 py-2 font-medium rounded-md transition ${
                activeSectionTab === 'career-paths' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Career Paths
            </button>
            <button 
              onClick={() => setActiveSectionTab('progress')}
              className={`px-4 py-2 font-medium rounded-md transition ${
                activeSectionTab === 'progress' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Skill Progress
            </button>
          </div>
          
          {/* Dynamic Section Content */}
          {activeSectionTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Skill Breakdown */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Skills Breakdown</h3>
                {userSkills.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={processSkillDataForChart()}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {processSkillDataForChart().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} Skills`, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-72 text-center">
                    <p className="text-gray-500 mb-4">No skills added to your profile yet</p>
                    <Link href="/skillmanagement" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                      Add Skills
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Top Career Matches */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Career Matches</h3>
                {recommendedPaths.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={recommendedPaths.slice(0, 5)}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip formatter={(value) => [`${value}% Match`, 'Match Score']} />
                        <Bar dataKey="match" fill="#8884d8">
                          {recommendedPaths.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-72 text-center">
                    <p className="text-gray-500 mb-4">Add skills to see career matches</p>
                    <Link href="/skillmanagement" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                      Add Skills
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Skill Gap Preview */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Critical Skill Gaps</h3>
                  <button 
                    onClick={() => setActiveSectionTab('skill-gap')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Full Analysis
                  </button>
                </div>
                {skillGapData.length > 0 ? (
                  <div>
                    <ul className="space-y-3">
                      {skillGapData.filter(skill => skill.gapValue > 0).slice(0, 5).map((skill, index) => (
                        <li key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${skill.importance >= 4 ? 'bg-red-500' : 'bg-yellow-500'} mr-2`}></div>
                            <span>{skill.name}</span>
                          </div>
                          <span className={`text-sm font-medium ${skill.importance >= 4 ? 'text-red-600' : 'text-yellow-600'}`}>
                            {skill.importance >= 4 ? 'Critical' : 'Important'}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-700">
                        {skillGapData.filter(skill => skill.gapValue > 0).length > 5 ? 
                          `${skillGapData.filter(skill => skill.gapValue > 0).length - 5} more skill gaps identified.` : 
                          "All critical skill gaps shown above."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No skill gaps to display</p>
                )}
              </div>
              
              {/* Market Trends Preview */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Market Trends</h3>
                  <button 
                    onClick={() => setActiveSectionTab('market-trends')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View All Trends
                  </button>
                </div>
                {marketTrends.length > 0 ? (
                  <div>
                    <div className="space-y-4">
                      {marketTrends.slice(0, 3).map((trend, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{trend.skill}</span>
                            <span className="text-green-600 font-medium">+{trend.growthRate}% Growth</span>
                          </div>
                          <div className="mt-2 flex justify-between text-sm text-gray-600">
                            <span>Demand: {trend.demandLevel}</span>
                            <span>Salary Impact: {trend.salaryImpact}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-gray-700">
                      Based on current industry data and hiring trends.
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No market trend data available</p>
                )}
              </div>
            </div>
          )}
          
          {/* Skill Gap Analysis Section */}
          {activeSectionTab === 'skill-gap' && (
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Skill Gap Analysis</h3>
                <p className="text-gray-700 mb-6">
                  This analysis compares your current skills with the most in-demand skills in your target industry.
                  Addressing these gaps can significantly improve your employability and career prospects.
                </p>
                
                {skillGapData.length > 0 ? (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={skillGapData.slice(0, 10)}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 5]} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          tick={{ fill: '#333', fontSize: 12 }}
                        />
                        <Tooltip formatter={(value) => value > 0 ? ['Missing Skill', 'Gap'] : ['Acquired', 'Status']} />
                        <Bar 
                          dataKey="gapValue" 
                          name="Gap Priority"
                          fill="#8884d8"
                        >
                          {skillGapData.slice(0, 10).map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.gapValue > 0 ? 
                                (entry.importance >= 4 ? '#ef4444' : '#f59e0b') : 
                                '#10b981'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-72 text-center">
                    <p className="text-gray-500 mb-4">No skill gap data available</p>
                    <Link href="/skillmanagement" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                      Update Skills
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommendations to Close Skill Gaps</h3>
                
                {skillGapData.filter(skill => skill.gapValue > 0).length > 0 ? (
                  <div className="space-y-6">
                    {skillGapData.filter(skill => skill.gapValue > 0).slice(0, 3).map((skill, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-lg">{skill.name}</h4>
                        <p className="text-gray-700 mt-2 mb-3">
                          {skill.importance >= 4 
                            ? `${skill.name} is a critical skill gap. Adding this to your portfolio would significantly improve your job market competitiveness.` 
                            : `${skill.name} is an important skill in your target industry. Consider developing this skill to enhance your profile.`
                          }
                        </p>
                        <div className="border-t pt-3">
                          <h5 className="font-medium mb-2">Learning Resources:</h5>
                          <ul className="space-y-1 text-blue-600">
                            <li className="hover:underline cursor-pointer">• Online courses on {skill.name}</li>
                            <li className="hover:underline cursor-pointer">• {skill.name} certification programs</li>
                            <li className="hover:underline cursor-pointer">• Practice projects to develop {skill.name}</li>
                          </ul>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800">Take action on skill gaps</h4>
                      <p className="text-blue-700 mt-2">
                        Visit our skills management page to update your profile as you acquire new skills.
                        The system will recalculate your match scores and provide updated recommendations.
                      </p>
                      <div className="mt-3">
                        <Link href="/skillmanagement" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                          Update Skills
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Add skills to see personalized recommendations</p>
                )}
              </div>
            </div>
          )}
          
          {/* Market Trends Section */}
          {activeSectionTab === 'market-trends' && (
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Skill Growth Trends</h3>
                <p className="text-gray-700 mb-6">
                  This chart shows projected growth rates for your skills based on current industry data.
                  Higher growth indicates increasing demand in the job market.
                </p>
                
                {marketTrends.length > 0 ? (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={marketTrends}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="skill" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, 'Growth Rate']} />
                        <Bar dataKey="growthRate" fill="#8884d8">
                          {marketTrends.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.growthRate > 10 ? '#10b981' : (entry.growthRate > 5 ? '#3b82f6' : '#f59e0b')} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-72 text-center">
                    <p className="text-gray-500 mb-4">No market trend data available</p>
                    <Link href="/skillmanagement" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                      Add Skills
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Industry Demand by Skill</h3>
                <p className="text-gray-700 mb-6">
                  This analysis shows how your skills are valued across different industries.
                  Darker colors indicate higher demand for that skill in a particular industry.
                </p>
                
                {skillDemandData.length > 0 ? (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={150} data={skillDemandData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="skill" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="Technology" dataKey="Technology" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Radar name="Healthcare" dataKey="Healthcare" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                        <Radar name="Finance" dataKey="Finance" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-72 text-center">
                    <p className="text-gray-500 mb-4">No industry demand data available</p>
                    <Link href="/skillmanagement" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                      Add Skills
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Market Insights</h3>
                
                {marketTrends.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Skill</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Growth Rate</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Demand Level</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Salary Impact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketTrends.map((trend, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm font-medium">{trend.skill}</td>
                            <td className="py-3 px-4 text-sm">
                              <span className={`px-2 py-1 rounded-full ${
                                trend.growthRate > 10 
                                  ? 'bg-green-100 text-green-800' 
                                  : (trend.growthRate > 5 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-yellow-100 text-yellow-800')
                              }`}>
                                +{trend.growthRate}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <span className={`px-2 py-1 rounded-full ${
                                trend.demandLevel === 'High' 
                                  ? 'bg-green-100 text-green-800' 
                                  : (trend.demandLevel === 'Medium' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-gray-100 text-gray-800')
                              }`}>
                                {trend.demandLevel}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm font-medium">{trend.salaryImpact}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No market insight data available</p>
                )}
              </div>
            </div>
          )}
          
          {/* Career Paths Section */}
          {activeSectionTab === 'career-paths' && (
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommended Career Paths</h3>
                <p className="text-gray-700 mb-6">
                  Based on your skills, education, and preferences, these career paths offer the best alignment with your profile.
                  The match percentage indicates how well your current profile aligns with typical requirements for each path.
                </p>
                
                {recommendedPaths.length > 0 ? (
                  <div>
                    {recommendedPaths.map((path, index) => (
                      <div key={index} className={`mb-6 p-6 rounded-lg ${
                        index === 0 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                          <h4 className="text-xl font-semibold mb-2 md:mb-0">{path.name}</h4>
                          <div className="flex items-center">
                            <div className="bg-white shadow-sm rounded-full overflow-hidden w-32 h-4 mr-2">
                              <div 
                                className="h-full bg-blue-600" 
                                style={{ width: `${path.match}%` }}
                              ></div>
                            </div>
                            <span className="text-blue-700 font-medium">{path.match}% Match</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div>
                            <h5 className="text-gray-700 font-medium mb-1">Salary Range</h5>
                            <p className="text-green-700 font-semibold">{path.salary}</p>
                          </div>
                          <div>
                            <h5 className="text-gray-700 font-medium mb-1">Growth Outlook</h5>
                            <p className="text-blue-700">{path.growth}</p>
                          </div>
                          <div>
                            <h5 className="text-gray-700 font-medium mb-1">Education</h5>
                            <p className="text-gray-800">{path.education}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-gray-700 font-medium mb-2">Next Steps to Pursue This Path</h5>
                          <ul className="space-y-1 text-gray-800">
                            {path.nextSteps.map((step, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="inline-block bg-blue-100 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">
                                  {idx + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {index === 0 && (
                          <div className="mt-4 pt-4 border-t border-blue-200 flex justify-between items-center">
                            <div>
                              <span className="text-blue-800 font-medium">Top Match</span>
                              <p className="text-blue-700 text-sm mt-1">
                                This career path offers the strongest alignment with your current profile
                              </p>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                              Explore Path
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-gray-500 mb-4">
                      No career path recommendations available. Update your profile to see personalized suggestions.
                    </p>
                    <div className="flex space-x-4">
                      <Link href="/skillmanagement" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                        Update Skills
                      </Link>
                      <Link href="/careerpreferences" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition">
                        Set Preferences
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Skill Development Plan</h3>
                <p className="text-gray-700 mb-6">
                  A roadmap to help you develop the right skills to reach your target career path.
                </p>
                
                {recommendedPaths.length > 0 ? (
                  <div className="border-l-2 border-blue-200 pl-6 ml-4">
                    <div className="relative mb-8">
                      <div className="absolute -left-10 top-0 bg-white border-2 border-blue-400 rounded-full w-8 h-8 flex items-center justify-center">
                        <span className="text-blue-600">1</span>
                      </div>
                      <h4 className="text-lg font-medium text-gray-800 mb-2">
                        Foundation Skills
                      </h4>
                      <p className="text-gray-700 mb-3">
                        Focus on building these core skills for your target career path in {recommendedPaths[0]?.name || 'your field'}.
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <ul className="space-y-2">
                          {skillGapData.filter(skill => skill.gapValue > 0).slice(0, 3).map((skill, idx) => (
                            <li key={idx} className="flex items-center">
                              <div className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                                <span className="text-gray-700 text-xs">{idx + 1}</span>
                              </div>
                              <span>{skill.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="relative mb-8">
                      <div className="absolute -left-10 top-0 bg-white border-2 border-blue-400 rounded-full w-8 h-8 flex items-center justify-center">
                        <span className="text-blue-600">2</span>
                      </div>
                      <h4 className="text-lg font-medium text-gray-800 mb-2">
                        Intermediate Development
                      </h4>
                      <p className="text-gray-700 mb-3">
                        After mastering the foundations, develop these specialized skills.
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <ul className="space-y-2">
                          {userSkills.length > 0 ? (
                            ["Advanced " + (userSkills[0] || "Programming"), 
                             "Project-based " + (userSkills[1] || "Data Analysis"), 
                             "Team Leadership"].map((skill, idx) => (
                              <li key={idx} className="flex items-center">
                                <div className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                                  <span className="text-gray-700 text-xs">{idx + 1}</span>
                                </div>
                                <span>{skill}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-gray-500">Add skills to see recommendations</li>
                          )}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute -left-10 top-0 bg-white border-2 border-blue-400 rounded-full w-8 h-8 flex items-center justify-center">
                        <span className="text-blue-600">3</span>
                      </div>
                      <h4 className="text-lg font-medium text-gray-800 mb-2">
                        Advanced Specialization
                      </h4>
                      <p className="text-gray-700 mb-3">
                        Specialized skills to distinguish yourself in {recommendedPaths[0]?.name || 'your field'}.
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <ul className="space-y-2">
                          {recommendedPaths.length > 0 ? (
                            recommendedPaths[0].nextSteps.map((step, idx) => (
                              <li key={idx} className="flex items-center">
                                <div className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                                  <span className="text-gray-700 text-xs">{idx + 1}</span>
                                </div>
                                <span>{step.replace("Learn ", "")}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-gray-500">Add career preferences to see recommendations</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Update your profile to see a personalized skill development plan
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Skill Progress Section */}
          {activeSectionTab === 'progress' && (
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Skill Development Progress</h3>
                <p className="text-gray-700 mb-6">
                  Track your skill development over time. This helps you visualize your growth journey.
                </p>
                
                {skillProgressData.length > 0 ? (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={skillProgressData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="skillCount" stroke="#8884d8" name="Skills Added" />
                        <Line yAxisId="right" type="monotone" dataKey="proficiency" stroke="#82ca9d" name="Avg. Proficiency" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-72 text-center">
                    <p className="text-gray-500 mb-4">No progress data available yet</p>
                    <Link href="/skillmanagement" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                      Update Skills
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Current Skills</h3>
                
                {userSkills.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {userSkills.map((skill, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-50 p-3 rounded-lg flex items-center justify-between"
                      >
                        <span>{skill}</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {["Beginner", "Intermediate", "Advanced"][Math.floor(Math.random() * 3)]}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No skills added to your profile yet</p>
                )}
                
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800">Skill Management</h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Add, update or remove skills from your profile
                      </p>
                    </div>
                    <Link href="/skillmanagement" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                      Manage Skills
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Learning Recommendations</h3>
                
                {userSkills.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h4 className="font-medium text-blue-800 mb-3">Recommended Courses</h4>
                      <ul className="space-y-3">
                        {["Introduction to Data Science", 
                          "Advanced JavaScript Techniques", 
                          "Leadership in Tech Organizations"].map((course, idx) => (
                          <li key={idx} className="flex items-start">
                            <div className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center mt-0.5 mr-2">
                              <span className="text-blue-800 text-xs">{idx + 1}</span>
                            </div>
                            <div>
                              <h5 className="font-medium">{course}</h5>
                              <p className="text-sm text-gray-600">
                                {idx === 0 ? "Based on your interest in data analysis" :
                                 idx === 1 ? "Complements your programming skills" :
                                 "Enhances your career growth potential"}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <h4 className="font-medium text-green-800 mb-3">Skill Practice Projects</h4>
                      <ul className="space-y-3">
                        {["Build a personal portfolio website",
                          "Create a data visualization dashboard",
                          "Contribute to an open-source project"].map((project, idx) => (
                          <li key={idx} className="flex items-start">
                            <div className="bg-green-200 rounded-full w-6 h-6 flex items-center justify-center mt-0.5 mr-2">
                              <span className="text-green-800 text-xs">{idx + 1}</span>
                            </div>
                            <div>
                              <h5 className="font-medium">{project}</h5>
                              <p className="text-sm text-gray-600">
                                {idx === 0 ? "Practice your web development skills" :
                                 idx === 1 ? "Apply data analysis in a practical context" :
                                 "Gain collaborative development experience"}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Add skills to your profile to receive personalized learning recommendations
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Action Button Section */}
          <div className="mt-8 bg-blue-500 p-8 rounded-lg shadow-md text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="font-bold text-2xl mb-2">Update Your Skills</h3>
                <p className="mb-4">Keep your skill profile current to get the most accurate recommendations.</p>
                <Link href="/skillmanagement" className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition">
                  Manage Skills
                </Link>
              </div>
              
              <div className="text-center">
                <h3 className="font-bold text-2xl mb-2">Set Career Preferences</h3>
                <p className="mb-4">Tell us about your desired industries, job types, and work preferences.</p>
                <Link href="/careerpreferences" className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition">
                  Set Preferences
                </Link>
              </div>
              
              <div className="text-center">
                <h3 className="font-bold text-2xl mb-2">Explore Job Listings</h3>
                <p className="mb-4">Find job opportunities that match your skills and preferences.</p>
                <Link href="/jobs" className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition">
                  Find Jobs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sign-In Popup Modal */}
      {!user && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center w-96 z-30">
            <h2 className="text-2xl font-bold text-gray-900">Sign In Required</h2>
            <p className="text-gray-600 mt-2">
              Please sign in to view your career dashboard.
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="mt-4 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold uppercase tracking-wider hover:bg-red-600 transition"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}