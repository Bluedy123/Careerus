"use client";

import { useState, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Stack, CircularProgress } from "@mui/material";
import { getFeedbacks, getUser, getUserProfile } from "@/lib/supabase";
import Link from "next/link";

// Initialize the Google Generative AI client with an API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// Set the AI model to be used for generation
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
});

// Helper function to create a prompt for generating a career report
function createPromptToGenerateReport(name, major, skills, goal) {
    return `Generate career report for ${name}, who is a university student, in 250 words.
This student's field of study is ${major}, and is superior in terms of ${skills}. 
The education level is ${goal}. Use "You" instead of "He" or "She".`;
}

// Helper function to convert an array of feedbacks into a bullet-point list
function createNumberedFeedbackListString(feedbacks) {
    return feedbacks.map(({ content }) => "- " + content).join("\n");
}

// Helper function to create a prompt for summarizing feedbacks
function createPromptToSummarizeFeedbacks(feedbacksString) {
    return `feedbacks: 
    ${feedbacksString}
    
    Write the summary of above. 
    Before writing that summary, use "Summary of Feedbacks" as small title.`;
}

export default function CareerReportGeneratorPage() {
    const [report, setReport] = useState("");
    const [loginUser, setLoginUser] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [studentInfo, setStudentInfo] = useState(null);
    const [submittedFeedback, setSubmittedFeedback] = useState([]);
    console.log("loaded");

    // Load the user session info from Supabase
    useEffect(() => {
        async function fetchUser() {
            try {
                const { user } = await getUser();
                setLoginUser(user);
            } catch {
                console.error("Error loading career report page:", error);
            } finally {
                setIsLoaded(true); // Set loading to true regardless of success
            }
        }
        fetchUser().catch(console.error);
    }, []);

    // Load the user's profile if they are logged in
    useEffect(() => {
        async function fetchUserProfile() {
            if (!loginUser) return;
            const data = await getUserProfile(loginUser.id);
            setStudentInfo(data);
        }
        fetchUserProfile().catch(console.error);
    }, [loginUser]);

    // Load submitted feedback if the user is logged in
    useEffect(() => {
        async function fetchFeedbacks() {
            if (!loginUser) return;
            const data = await getFeedbacks(loginUser.id);
            setSubmittedFeedback(data);
        }
        fetchFeedbacks().catch(console.error);
    }, [loginUser]);

    // Generate the AI-powered career report once studentInfo and feedback are loaded
    useEffect(() => {
        async function getCareerReport() {
            if (!studentInfo) return;
            try {
                setIsGeneratingReport(true);

                // Generate main career report
                const result = await model.generateContent(
                    createPromptToGenerateReport(
                        studentInfo.user_profiles[0].full_name,
                        studentInfo.user_profiles[0].field_of_study,
                        studentInfo.user_profiles[0].skills,
                        studentInfo.user_profiles[0].education_level,
                    ),
                );

                // Summarize feedbacks
                const feedbackString =
                    createNumberedFeedbackListString(submittedFeedback);
                const feedbackSummaryPrompt =
                    createPromptToSummarizeFeedbacks(feedbackString);
                const summaryResult = await model.generateContent(
                    feedbackSummaryPrompt,
                );

                // Combine both parts and update the report
                setReport(
                    result.response.candidates[0].content.parts[0].text +
                        "\n" +
                        summaryResult.response.candidates[0].content.parts[0]
                            .text,
                );
            } catch (error) {
                console.error("Error generating career report:", error);
                setReport("Failed to generate report.");
            } finally {
                setIsGeneratingReport(false);
            }
        }
        getCareerReport();
    }, [studentInfo, submittedFeedback]);

    // Show loading screen while user data is being loaded
    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Loading career report...</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Header */}
            <header className="bg-black text-white py-20 text-center">
                <h1 className="text-5xl font-extrabold uppercase tracking-wide">
                    Career <span className="text-red-400">Report</span>
                </h1>
                <p className="text-lg mt-4 text-gray-300 max-w-3xl mx-auto">
                    Insights based on your major and skills
                </p>
            </header>

            {/* Report Section */}
            <section className="max-w-4xl mx-auto py-16 px-6">
                <h2 className="text-3xl font-semibold text-gray-900 text-center">
                    Career Personalized Report
                </h2>

                <div className="bg-white p-6 rounded-lg shadow-lg text-left leading-relaxed prose prose-lg mt-8">
                    {/* Show login prompt if user is not signed in */}
                    {!loginUser && (
                        <div className="text-center text-gray-500">
                            Please login to generate career report.
                        </div>
                    )}

                    {/* Show loading spinner if generating report */}
                    {isGeneratingReport ? (
                        <Stack spacing={2} alignItems="center">
                            <div className="text-center text-gray-500">
                                Generating career report...
                            </div>
                            <CircularProgress color="inherit" />
                        </Stack>
                    ) : (
                        // Display the AI-generated Markdown report
                        <Markdown remarkPlugins={[remarkGfm]}>
                            {report}
                        </Markdown>
                    )}
                </div>
            </section>

            {/* Login Modal if user is not authenticated */}
            {!loginUser && isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center w-96 z-30">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Sign In Required
                        </h2>
                        <p className="text-gray-600 mt-2">Please sign in.</p>
                        <Link href="/auth/login">
                            <button className="mt-4 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold uppercase tracking-wider hover:bg-red-600 transition">
                                Sign In
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
