"use client";

import React, { useState, useEffect, useRef } from 'react';
import { generateSummary, generateExperienceDescription } from '@/lib/google/geminiClient';
import { usePDF } from 'react-to-pdf';
import Link from 'next/link';
import { getThemeStyles, availableThemes } from '@/lib/themes/resumeThemes';

export default function ResumeGenerator() {
  const { toPDF, targetRef } = usePDF({filename: 'resume.pdf'});
  
  // Resume sections tracking
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Personal Info', 'Experience', 'Education', 'Skills', 'Review'];
  
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    title: '',
    address: '',
    phone: '',
    email: '',
    summary: ''
  });

  const [experiences, setExperiences] = useState([{
    positionTitle: '',
    companyName: '',
    city: '',
    state: '',
    startDate: '',
    endDate: '',
    summary: ''
  }]);

  const [education, setEducation] = useState([{
    school: '',
    degree: '',
    fieldOfStudy: '',
    city: '',
    state: '',
    graduationDate: '',
    achievements: ''
  }]);

  const [skills, setSkills] = useState({
    technical: '',
    soft: '',
    languages: '',
    certifications: ''
  });

  const [theme, setTheme] = useState('harvard');

  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleExperienceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = { ...updatedExperiences[index], [name]: value };
    setExperiences(updatedExperiences);
  };

  const addExperience = () => {
    setExperiences([...experiences, {
      positionTitle: '',
      companyName: '',
      city: '',
      state: '',
      startDate: '',
      endDate: '',
      summary: ''
    }]);
  };

  const removeExperience = (index) => {
    const updatedExperiences = [...experiences];
    updatedExperiences.splice(index, 1);
    setExperiences(updatedExperiences);
  };

  const generateAISummary = async (index) => {
    try {
      const jobTitle = experiences[index].positionTitle;
      const companyName = experiences[index].companyName;
      
      if (jobTitle && companyName) {
        const experienceInfo = `${jobTitle} at ${companyName}`;
        const descriptions = await generateExperienceDescription(experienceInfo);
        
        if (descriptions && descriptions.length > 0) {
          // Use the high activity description by default
          const highActivityDesc = descriptions.find(desc => 
            desc.activity_level.toLowerCase().includes('high'));
          
          if (highActivityDesc) {
            const updatedExperiences = [...experiences];
            updatedExperiences[index] = { 
              ...updatedExperiences[index], 
              summary: highActivityDesc.description 
            };
            setExperiences(updatedExperiences);
          }
        }
      }
    } catch (error) {
      console.error("Error generating AI description:", error);
    }
  };

  const generatePersonalSummary = async () => {
    try {
      const summaries = await generateSummary(personalInfo.title);
      
      if (summaries && summaries.length > 0) {
        // Use the senior level summary by default
        const seniorSummary = summaries.find(sum => 
          sum.experience_level.toLowerCase().includes('senior'));
        
        if (seniorSummary) {
          setPersonalInfo(prev => ({ 
            ...prev, 
            summary: seniorSummary.summary 
          }));
        }
      }
    } catch (error) {
      console.error("Error generating personal summary:", error);
    }
  };

  const saveResume = () => {
    // Implement save functionality - could save to localStorage, a file, or a database
    console.log("Saving resume:", { personalInfo, experiences, theme });
    alert("Resume saved successfully!");
  };

  const downloadPDF = () => {
    // Show a loading indicator or message if needed
    // Set activeStep to review before downloading to show complete resume
    setActiveStep(4);
    
    // Allow time for the UI to update
    setTimeout(() => {
      toPDF();
    }, 300);
  };

  const changeTheme = () => {
    // Rotate through themes
    const currentIndex = availableThemes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    setTheme(availableThemes[nextIndex]);
  };
  
  const nextStep = () => {
    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  };
  
  const prevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const handleEducationChange = (index, e) => {
    const { name, value } = e.target;
    const updatedEducation = [...education];
    updatedEducation[index] = { ...updatedEducation[index], [name]: value };
    setEducation(updatedEducation);
  };

  const addEducation = () => {
    setEducation([...education, {
      school: '',
      degree: '',
      fieldOfStudy: '',
      city: '',
      state: '',
      graduationDate: '',
      achievements: ''
    }]);
  };

  const removeEducation = (index) => {
    const updatedEducation = [...education];
    updatedEducation.splice(index, 1);
    setEducation(updatedEducation);
  };

  const handleSkillsChange = (e) => {
    const { name, value } = e.target;
    setSkills(prev => ({ ...prev, [name]: value }));
  };

  // Get theme styles
  const themeStyles = getThemeStyles(theme);

  return (
    <div className="bg-gray-100 min-h-screen pb-10">
      {/* Header with Navigation & Branding */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold flex items-center text-black">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            ResumeCraft
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center">
              <button 
                onClick={changeTheme} 
                className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                Resume Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </button>
            </div>
            
            <button 
              onClick={downloadPDF} 
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </button>
            
            <button 
              onClick={saveResume} 
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Save
            </button>
          </div>
        </div>
      </header>
      
      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between mb-4">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  index < activeStep ? 'bg-green-500 text-white' : 
                  index === activeStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                } transition-colors duration-300`}
              >
                {index < activeStep ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-sm text-black ${index === activeStep ? 'font-semibold' : ''}`}>{step}</span>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-100 h-2 rounded-full">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300" 
            style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Main content container */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:space-x-6">
          {/* Left Column - Form */}
          <div className={`${showMobilePreview ? 'hidden md:block' : 'block'} md:w-1/2 space-y-6`}>
            {activeStep === 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300">
                <h2 className="text-xl font-semibold mb-6 pb-2 border-b" style={{ color: themeStyles.headingColor }}>
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={personalInfo.name}
                      onChange={handlePersonalInfoChange}
                      placeholder="John Doe"
                      className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      name="title"
                      value={personalInfo.title}
                      onChange={handlePersonalInfoChange}
                      placeholder="Software Engineer"
                      className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={personalInfo.address}
                      onChange={handlePersonalInfoChange}
                      placeholder="123 Main St, City, State 12345"
                      className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={personalInfo.phone}
                      onChange={handlePersonalInfoChange}
                      placeholder="(555) 123-4567"
                      className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={personalInfo.email}
                      onChange={handlePersonalInfoChange}
                      placeholder="john.doe@example.com"
                      className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Professional Summary</label>
                      <button
                        onClick={generatePersonalSummary}
                        className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-md flex items-center hover:bg-blue-100 transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M15 9l-6 6" />
                          <path d="M9 9l6 6" />
                        </svg>
                        Generate with AI
                      </button>
                    </div>
                    <textarea
                      name="summary"
                      value={personalInfo.summary}
                      onChange={handlePersonalInfoChange}
                      rows="4"
                      placeholder="Write a brief summary of your professional background and key qualifications..."
                      className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Tip: Keep your summary concise (3-5 sentences) highlighting your experience, key skills, and career goals.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {activeStep === 1 && (
              <div className="space-y-6">
                {experiences.map((exp, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-md transition-all duration-300">
                    <div className="flex justify-between items-center mb-6 pb-2 border-b">
                      <h2 className="text-xl font-semibold" style={{ color: themeStyles.headingColor }}>
                        {index === 0 ? 'Professional Experience' : `Experience ${index + 1}`}
                      </h2>
                      {index > 0 && (
                        <button 
                          onClick={() => removeExperience(index)}
                          className="text-red-600 hover:text-red-800 flex items-center text-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position Title</label>
                        <input
                          type="text"
                          name="positionTitle"
                          value={exp.positionTitle}
                          onChange={(e) => handleExperienceChange(index, e)}
                          placeholder="Senior Software Developer"
                          className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <input
                          type="text"
                          name="companyName"
                          value={exp.companyName}
                          onChange={(e) => handleExperienceChange(index, e)}
                          placeholder="Acme Corporation"
                          className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          name="city"
                          value={exp.city}
                          onChange={(e) => handleExperienceChange(index, e)}
                          placeholder="San Francisco"
                          className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          name="state"
                          value={exp.state}
                          onChange={(e) => handleExperienceChange(index, e)}
                          placeholder="CA"
                          className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          name="startDate"
                          value={exp.startDate}
                          onChange={(e) => handleExperienceChange(index, e)}
                          className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          name="endDate"
                          value={exp.endDate}
                          onChange={(e) => handleExperienceChange(index, e)}
                          className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">Responsibilities & Achievements</label>
                          <button
                            onClick={() => generateAISummary(index)}
                            className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-md flex items-center hover:bg-blue-100 transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M15 9l-6 6" />
                              <path d="M9 9l6 6" />
                            </svg>
                            Generate with AI
                          </button>
                        </div>
                        <div className="border border-gray-300 rounded-md shadow-sm bg-white overflow-hidden">
                          <div className="flex border-b p-2 bg-gray-50">
                            <div className="flex space-x-1">
                              <button className="p-1 hover:bg-gray-200 rounded" title="Bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                                  <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                                </svg>
                              </button>
                              <button className="p-1 hover:bg-gray-200 rounded" title="Italic">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="19" y1="4" x2="10" y2="4"></line>
                                  <line x1="14" y1="20" x2="5" y2="20"></line>
                                  <line x1="15" y1="4" x2="9" y2="20"></line>
                                </svg>
                              </button>
                              <button className="p-1 hover:bg-gray-200 rounded" title="Bullet List">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="8" y1="6" x2="21" y2="6"></line>
                                  <line x1="8" y1="12" x2="21" y2="12"></line>
                                  <line x1="8" y1="18" x2="21" y2="18"></line>
                                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                                </svg>
                              </button>
                              <button className="p-1 hover:bg-gray-200 rounded" title="Numbered List">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="10" y1="6" x2="21" y2="6"></line>
                                  <line x1="10" y1="12" x2="21" y2="12"></line>
                                  <line x1="10" y1="18" x2="21" y2="18"></line>
                                  <path d="M4 6h1v4"></path>
                                  <path d="M4 10h2"></path>
                                  <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                          <textarea
                            name="summary"
                            value={exp.summary}
                            onChange={(e) => handleExperienceChange(index, e)}
                            rows="5"
                            placeholder="Describe your responsibilities, achievements, and the impact you made in this role..."
                            className="w-full p-3 border-none focus:ring-0 focus:outline-none text-black"
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          Tip: Use bullet points to highlight key achievements and quantify results when possible.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addExperience}
                  className="w-full bg-white border border-gray-300 border-dashed rounded-lg p-4 text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  Add Another Position
                </button>
              </div>
            )}
            
            {activeStep === 2 && (
              <div className="space-y-6">
                {education.map((edu, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-md transition-all duration-300">
                    <div className="flex justify-between items-center mb-6 pb-2 border-b">
                      <h2 className="text-xl font-semibold" style={{ color: themeStyles.headingColor }}>
                        {index === 0 ? 'Education' : `Education ${index + 1}`}
                      </h2>
                      {index > 0 && (
                        <button 
                          onClick={() => removeEducation(index)}
                          className="text-red-600 hover:text-red-800 flex items-center text-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">School/University</label>
                        <input
                          type="text"
                          name="school"
                          value={edu.school}
                          onChange={(e) => handleEducationChange(index, e)}
                          placeholder="Harvard University"
                          className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                        <input
                          type="text"
                          name="degree"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, e)}
                          placeholder="Bachelor of Science"
                          className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                        <input
                          type="text"
                          name="fieldOfStudy"
                          value={edu.fieldOfStudy}
                          onChange={(e) => handleEducationChange(index, e)}
                          placeholder="Computer Science"
                          className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          name="city"
                          value={edu.city}
                          onChange={(e) => handleEducationChange(index, e)}
                          placeholder="Cambridge"
                          className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          name="state"
                          value={edu.state}
                          onChange={(e) => handleEducationChange(index, e)}
                          placeholder="MA"
                          className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Date</label>
                        <input
                          type="date"
                          name="graduationDate"
                          value={edu.graduationDate}
                          onChange={(e) => handleEducationChange(index, e)}
                          className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Achievements/Activities</label>
                        <textarea
                          name="achievements"
                          value={edu.achievements}
                          onChange={(e) => handleEducationChange(index, e)}
                          rows="3"
                          placeholder="Dean's List, Academic Scholarships, Relevant Coursework, etc."
                          className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addEducation}
                  className="w-full bg-white border border-gray-300 border-dashed rounded-lg p-4 text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  Add Another Education
                </button>
              </div>
            )}
            
            {activeStep === 3 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-6 pb-2 border-b" style={{ color: themeStyles.headingColor }}>
                  Skills & Qualifications
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Technical Skills</label>
                    <textarea
                      name="technical"
                      value={skills.technical}
                      onChange={handleSkillsChange}
                      rows="3"
                      placeholder="Programming languages, software, tools, platforms (e.g., JavaScript, React, AWS, Photoshop)"
                      className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                    />
                    <p className="mt-1 text-xs text-gray-500">Tip: Separate skills with commas. List most relevant skills first.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Soft Skills</label>
                    <textarea
                      name="soft"
                      value={skills.soft}
                      onChange={handleSkillsChange}
                      rows="3"
                      placeholder="Communication, leadership, teamwork, problem-solving, time management"
                      className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                    <textarea
                      name="languages"
                      value={skills.languages}
                      onChange={handleSkillsChange}
                      rows="2"
                      placeholder="English (Native), Spanish (Fluent), Mandarin (Conversational)"
                      className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certifications & Licenses</label>
                    <textarea
                      name="certifications"
                      value={skills.certifications}
                      onChange={handleSkillsChange}
                      rows="3"
                      placeholder="AWS Certified Solutions Architect, Google Analytics Certification, PMP"
                      className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeStep === 4 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-6 pb-2 border-b" style={{ color: themeStyles.headingColor }}>
                  Review & Finalize
                </h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                    <h3 className="text-blue-800 font-medium mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      Ready to finalize
                    </h3>
                    <p className="text-blue-700 text-sm">
                      Review your resume in the preview panel. Once you&apos;re satisfied, click the &quot;Download PDF&quot; button to save your professional resume.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center py-6">
                    <button
                      onClick={downloadPDF}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 flex items-center text-lg font-medium transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download Your Resume
                    </button>
                  </div>
                  
                  <div className="border-t pt-4 mt-6">
                    <h3 className="font-medium mb-2">More options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="border border-gray-300 p-3 rounded-md hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                          <polyline points="17 21 17 13 7 13 7 21"></polyline>
                          <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        Save Project
                      </button>
                      <button 
                        onClick={changeTheme}
                        className="border border-gray-300 p-3 rounded-md hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <circle cx="12" cy="12" r="5"></circle>
                          <line x1="12" y1="1" x2="12" y2="3"></line>
                          <line x1="12" y1="21" x2="12" y2="23"></line>
                          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                          <line x1="1" y1="12" x2="3" y2="12"></line>
                          <line x1="21" y1="12" x2="23" y2="12"></line>
                          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                        Change Resume Theme
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4 mb-10">
              <button 
                onClick={prevStep}
                disabled={activeStep === 0}
                className={`flex items-center px-4 py-2 rounded-md ${
                  activeStep === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              <button 
                onClick={nextStep}
                disabled={activeStep === steps.length - 1}
                className={`flex items-center px-4 py-2 rounded-md ${
                  activeStep === steps.length - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Right Column - Resume Preview */}
          <div className={`${showMobilePreview ? 'block' : 'hidden md:block'} md:w-1/2`}>
            {/* Mobile Back Button */}
            <div className="md:hidden mb-4">
              <button 
                onClick={() => setShowMobilePreview(false)}
                className="flex items-center justify-center text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Editing
              </button>
            </div>
            
            <div 
              ref={targetRef} 
              className="bg-white p-8 rounded-lg shadow-md resume-preview mb-10"
              style={{ 
                color: themeStyles.primaryColor,
                fontFamily: themeStyles.fontFamily,
              }}
            >
              <div className={`${theme === 'harvard' ? 'text-center' : ''} border-b-2 pb-6 mb-6`} 
                   style={{ borderColor: themeStyles.borderColor || themeStyles.primaryColor }}>
                <h1 className={themeStyles.nameClass}>{personalInfo.name || 'YOUR NAME'}</h1>
                <p className={`text-lg ${theme === 'harvard' ? 'font-normal' : 'font-medium'}`} 
                   style={{ color: theme === 'harvard' ? '#000000' : themeStyles.headingColor }}>
                  {personalInfo.title || 'Professional Title'}
                </p>
                <div className={`flex flex-col ${theme === 'harvard' ? 'mt-2 text-black' : 'mt-3 text-gray-600'} ${theme === 'harvard' ? 'sm:flex-row sm:justify-center' : 'sm:flex-row sm:justify-between'} sm:items-center text-sm`}>
                  {theme === 'harvard' && themeStyles.useVerticalBars ? (
                    <div className="text-center text-black">
                      <span>{personalInfo.address || 'Your Address'}</span>
                      <span className="mx-2">|</span>
                      <span>{personalInfo.phone || 'Your Phone'}</span>
                      <span className="mx-2">|</span>
                      <span>{personalInfo.email || 'your.email@example.com'}</span>
                    </div>
                  ) : (
                    <>
                      <div className={`flex items-center mb-2 sm:mb-0 ${theme === 'harvard' ? 'sm:mr-6' : ''}`}>
                        {!themeStyles.hideIcons && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" style={{ color: theme === 'harvard' ? themeStyles.borderColor : themeStyles.primaryColor }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                        )}
                        <span>{personalInfo.address || 'Your Address'}</span>
                      </div>
                      <div className={`flex ${theme === 'harvard' ? 'flex-row items-center' : 'flex-col'}`}>
                        <div className="flex items-center mb-1 sm:mb-0 sm:mr-6">
                          {!themeStyles.hideIcons && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" style={{ color: theme === 'harvard' ? themeStyles.borderColor : themeStyles.primaryColor }}>
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                          )}
                          <span>{personalInfo.phone || 'Your Phone'}</span>
                        </div>
                        <div className="flex items-center">
                          {!themeStyles.hideIcons && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" style={{ color: theme === 'harvard' ? themeStyles.borderColor : themeStyles.primaryColor }}>
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                              <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                          )}
                          <span>{personalInfo.email || 'your.email@example.com'}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Professional Summary - Hidden for Harvard theme */}
              {!themeStyles.hideSummary && (
                <div className="mb-6">
                  <h2 className={`text-lg font-semibold mb-3 pb-1 border-b ${themeStyles.sectionHeadingClass || ''}`} style={{ color: themeStyles.headingColor, borderColor: 'rgba(0,0,0,0.1)' }}>
                    Professional Summary
                  </h2>
                  <p className={`leading-relaxed ${themeStyles.textColor || 'text-gray-700'}`}>
                    {personalInfo.summary || 'Your professional summary will appear here. A well-crafted summary highlights your expertise, experience, and key strengths in 3-5 concise sentences.'}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <h2 className={`text-lg font-semibold mb-4 ${theme === 'harvard' ? '' : 'pb-1 border-b'} ${themeStyles.sectionHeadingClass || ''}`} 
                    style={{ color: theme === 'harvard' ? '#000000' : themeStyles.headingColor, 
                            borderColor: theme === 'harvard' ? themeStyles.borderColor : 'rgba(0,0,0,0.1)' }}>
                  Professional Experience
                </h2>
                {experiences.length > 0 ? (
                  experiences.map((exp, index) => (
                    <div key={index} className="mb-5">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-semibold ${themeStyles.contentStyle?.jobTitle || ''}`} 
                            style={{ color: theme === 'harvard' ? '#000000' : themeStyles.primaryColor }}>
                          {exp.positionTitle || 'Position Title'}
                        </h3>
                        <p className={`text-sm ${themeStyles.contentStyle?.dateStyle || ''} ${themeStyles.textColor || 'text-gray-600'}`}>
                          {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - 
                          {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present'}
                        </p>
                      </div>
                      <p className={`${themeStyles.contentStyle?.companyName || 'font-medium'} mb-2 ${themeStyles.textColor || 'text-gray-700'}`}>
                        {exp.companyName || 'Company Name'}
                        {(exp.city || exp.state) && ', '}
                        {exp.city || ''}
                        {exp.city && exp.state && ', '}
                        {exp.state || ''}
                      </p>
                      <div className={`text-sm leading-relaxed ${themeStyles.contentStyle?.contentSpacing || ''} ${themeStyles.textColor || 'text-gray-700'}`} 
                           dangerouslySetInnerHTML={{ __html: exp.summary || 'Describe your responsibilities, achievements, and the impact you made in this role...' }} />
                    </div>
                  ))
                ) : (
                  <div className={`italic ${themeStyles.textColor || 'text-gray-500'}`}>Add your work experience to see it reflected here.</div>
                )}
              </div>
              
              {/* Education Section in Resume Preview */}
              <div className="mb-6">
                <h2 className={`text-lg font-semibold mb-4 pb-1 border-b ${themeStyles.sectionHeadingClass || ''}`} 
                    style={{ color: theme === 'harvard' ? '#000000' : themeStyles.headingColor, 
                            borderColor: theme === 'harvard' ? themeStyles.borderColor : 'rgba(0,0,0,0.1)' }}>
                  Education
                </h2>
                {education.length > 0 ? (
                  education.map((edu, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-semibold ${themeStyles.contentStyle?.mainText || ''}`} 
                            style={{ color: theme === 'harvard' ? '#000000' : themeStyles.primaryColor }}>
                          {edu.degree || 'Degree'}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                        </h3>
                        <p className={`text-sm ${themeStyles.contentStyle?.dateStyle || ''} ${themeStyles.textColor || 'text-gray-600'}`}>
                          {edu.graduationDate && new Date(edu.graduationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <p className={`font-medium mb-1 ${themeStyles.textColor || 'text-gray-700'}`}>
                        {edu.school || 'University/School Name'}
                        {(edu.city || edu.state) && ', '}
                        {edu.city || ''}
                        {edu.city && edu.state && ', '}
                        {edu.state || ''}
                      </p>
                      {edu.achievements && (
                        <p className={`text-sm ${themeStyles.contentStyle?.contentSpacing || ''} ${themeStyles.textColor || 'text-gray-700'}`}>{edu.achievements}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={`italic ${themeStyles.textColor || 'text-gray-500'}`}>Add your education to see it reflected here.</div>
                )}
              </div>
              
              {/* Skills Section in Resume Preview */}
              <div className="mb-6">
                <h2 className={`text-lg font-semibold mb-4 pb-1 border-b ${themeStyles.sectionHeadingClass || ''}`} 
                    style={{ color: theme === 'harvard' ? '#000000' : themeStyles.headingColor, 
                            borderColor: theme === 'harvard' ? themeStyles.borderColor : 'rgba(0,0,0,0.1)' }}>
                  Skills & Qualifications
                </h2>
                
                {skills.technical ? (
                  <div className="mb-3">
                    <h3 className={`font-medium text-sm ${theme === 'harvard' ? 'font-bold' : 'uppercase tracking-wider'} mb-1`} 
                        style={{ color: theme === 'harvard' ? '#000000' : themeStyles.primaryColor }}>
                      Technical Skills
                    </h3>
                    <p className={`text-sm ${theme === 'harvard' ? 'pl-0' : ''} ${themeStyles.textColor || 'text-gray-700'}`}>{skills.technical}</p>
                  </div>
                ) : null}
                
                {skills.soft ? (
                  <div className="mb-3">
                    <h3 className={`font-medium text-sm ${theme === 'harvard' ? 'font-bold' : 'uppercase tracking-wider'} mb-1`} 
                        style={{ color: theme === 'harvard' ? '#000000' : themeStyles.primaryColor }}>
                      Soft Skills
                    </h3>
                    <p className={`text-sm ${themeStyles.textColor || 'text-gray-700'}`}>{skills.soft}</p>
                  </div>
                ) : null}
                
                {skills.languages ? (
                  <div className="mb-3">
                    <h3 className={`font-medium text-sm ${theme === 'harvard' ? 'font-bold' : 'uppercase tracking-wider'} mb-1`} 
                        style={{ color: theme === 'harvard' ? '#000000' : themeStyles.primaryColor }}>
                      Languages
                    </h3>
                    <p className={`text-sm ${themeStyles.textColor || 'text-gray-700'}`}>{skills.languages}</p>
                  </div>
                ) : null}
                
                {skills.certifications ? (
                  <div className="mb-3">
                    <h3 className={`font-medium text-sm ${theme === 'harvard' ? 'font-bold' : 'uppercase tracking-wider'} mb-1`} 
                        style={{ color: theme === 'harvard' ? '#000000' : themeStyles.primaryColor }}>
                      Certifications & Licenses
                    </h3>
                    <p className={`text-sm ${themeStyles.textColor || 'text-gray-700'}`}>{skills.certifications}</p>
                  </div>
                ) : null}
                
                {!skills.technical && !skills.soft && !skills.languages && !skills.certifications && (
                  <div className={`italic ${themeStyles.textColor || 'text-gray-500'}`}>Add your skills to see them reflected here.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Preview Toggle */}
      <div className="md:hidden container mx-auto px-4 my-6">
        <button 
          onClick={() => setShowMobilePreview(!showMobilePreview)} 
          className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md flex items-center justify-center"
        >
          {showMobilePreview ? 'Return to Editing' : 'Preview Resume'}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
            {showMobilePreview ? (
              <>
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </>
            ) : (
              <>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </>
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
