"use client";

import { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Stack, CircularProgress } from "@mui/material";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
    getFeedbacks,
    getUser,
    getUserProfile,
    saveCareerReport,
    getCareerReports,
} from "@/lib/supabase";

// Initialize Generative AI model
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Creates a prompt to generate a personalized career report
function createPromptToGenerateReport(name, major, skills, goal) {
    return `Write a detailed and structured career report for ${name} in about 300 words.
    
    - Begin with a small bold title: "**Career Report for ${name}**".
    - Write an introductory paragraph summarizing the student's background.
    - List key strengths based on their field of study (${major}) and skills (${skills}).
    - Suggest 2-3 possible career paths aligned with their education goal (${goal}).
    - Conclude with motivational advice.
    
    Use "You" instead of "He" or "She".
    Keep the tone professional, supportive, and forward-looking.`;
}

// Formats feedback into a list string
function createNumberedFeedbackListString(feedbacks) {
    return feedbacks.map(({ content }) => "- " + content).join("\n");
}

// Creates a prompt to summarize the collected feedbacks
function createPromptToSummarizeFeedbacks(feedbacksString) {
    return `feedbacks:\n${feedbacksString}
    Write the summary of above.
    Before writing that summary, use \"Summary of Feedbacks\" as small title with bold font.`;
}

export default function CareerReportGeneratorPage() {
    const [report, setReport] = useState("");
    const [loginUser, setLoginUser] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [studentInfo, setStudentInfo] = useState(null);
    const [submittedFeedback, setSubmittedFeedback] = useState([]);
    const [savedReports, setSavedReports] = useState([]);
    const isSaved = useRef(false);
    const [isSaving, setIsSaving] = useState(false);
    const [openReportId, setOpenReportId] = useState(null);

    // Toggle expand/collapse for a saved report
    const toggleReport = (id) => {
        setOpenReportId((prevId) => (prevId === id ? null : id));
    };

    // Fetch the current logged-in user
    useEffect(() => {
        async function fetchUser() {
            try {
                const { user } = await getUser();
                setLoginUser(user);
            } catch {
                console.error("Error loading career report page");
            } finally {
                setIsLoaded(true);
            }
        }
        fetchUser();
    }, []);

    // Fetch student profile after login
    useEffect(() => {
        async function fetchUserProfile() {
            if (!loginUser) return;
            const data = await getUserProfile(loginUser.id);
            setStudentInfo(data);
        }
        fetchUserProfile();
    }, [loginUser]);

    // Fetch feedback submitted for the user
    useEffect(() => {
        async function fetchFeedbacks() {
            if (!loginUser) return;
            const data = await getFeedbacks(loginUser.id);
            setSubmittedFeedback(data);
        }
        fetchFeedbacks();
    }, [loginUser]);

    // Fetch previously saved career reports
    useEffect(() => {
        async function fetchSavedCareerReports() {
            if (!loginUser) return;
            const data = await getCareerReports(loginUser.id);
            setSavedReports(data);
        }
        fetchSavedCareerReports();
    }, [loginUser]);

    // Generate the career report whenever student info and feedback are ready
    useEffect(() => {
        async function getCareerReport() {
            if (!studentInfo) return;
            try {
                setIsGeneratingReport(true);

                // Create and send the main report generation prompt
                const result = await model.generateContent(
                    createPromptToGenerateReport(
                        studentInfo.user_profiles.full_name,
                        studentInfo.user_profiles.field_of_study,
                        studentInfo.user_profiles.skills,
                        studentInfo.user_profiles.education_level,
                    ),
                );

                // Create and send the feedback summary prompt
                const feedbackString =
                    createNumberedFeedbackListString(submittedFeedback);
                const summaryPrompt =
                    createPromptToSummarizeFeedbacks(feedbackString);
                const summaryResult =
                    await model.generateContent(summaryPrompt);

                // Combine the main report and feedback summary
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

    // Handle report submission (save to database)
    async function handleSubmit(e) {
        e.preventDefault();
        if (report !== "" && isSaved.current === false) {
            setIsSaving(true);
            try {
                await saveCareerReport(loginUser.id, report);
                isSaved.current = true;
            } catch (error) {
                console.error(error);
            } finally {
                setIsSaving(false);
            }
        }
    }

    // If loading user info, show loading UI
    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Loading career report...</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Header Section */}
            <header className="bg-gradient-to-r from-black via-gray-800 to-black text-white py-20 text-center">
                <h1 className="text-5xl font-extrabold tracking-wide uppercase">
                    Career <span className="text-red-400">Report</span>
                </h1>
                <p className="text-lg mt-4 text-gray-300 max-w-2xl mx-auto">
                    Insights based on your major and skills
                </p>
            </header>

            {/* Career Report Section */}
            <section className="max-w-5xl mx-auto py-8 px-6">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                    Your Personalized Career Report
                </h2>

                <div className="bg-white p-8 rounded-3xl shadow-xl">
                    {/* If user not logged in */}
                    {!loginUser && (
                        <div className="text-center text-gray-500">
                            Please login to generate career report.
                        </div>
                    )}

                    {/* If report is being generated */}
                    {isGeneratingReport ? (
                        <Stack spacing={2} alignItems="center">
                            <div className="text-gray-500">
                                Generating career report...
                            </div>
                            <CircularProgress color="inherit" />
                        </Stack>
                    ) : (
                        <Markdown remarkPlugins={[remarkGfm]}>
                            {report}
                        </Markdown>
                    )}
                </div>
            </section>

            {/* Save Report Button */}
            <div className="text-center mt-6 mb-10">
                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                    {isSaving ? "Saving..." : "Save"}
                </button>
            </div>

            {/* Display saved reports if any */}
            {savedReports.length > 0 && (
                <section className="max-w-6xl mx-auto py-12 px-6">
                    <h2 className="text-4xl font-extrabold text-center text-transparent bg-clip-text text-blue-900 mb-10">
                        Your Saved Reports
                    </h2>
                    <div className="space-y-6">
                        {savedReports.map((report) => {
                            const isOpen = openReportId === report.id;
                            return (
                                <div
                                    key={report.id}
                                    className="bg-white rounded-3xl p-6 border-2 border-transparent 
                                    hover:border-blue-400 transition-all duration-300 shadow-lg group"
                                >
                                    {/* Expand/collapse saved reports */}
                                    <button
                                        onClick={() => toggleReport(report.id)}
                                        className="w-full flex justify-between items-center font-bold text-xl text-gray-800"
                                    >
                                        <span className="group-hover:text-blue-500 transition-colors">
                                            Report{" "}
                                            {new Date(
                                                report.created_at,
                                            ).toLocaleString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                        <div
                                            className={`transform transition-transform duration-300 ${
                                                isOpen ? "rotate-180" : ""
                                            }`}
                                        >
                                            {isOpen ? (
                                                <ChevronUp />
                                            ) : (
                                                <ChevronDown />
                                            )}
                                        </div>
                                    </button>

                                    {/* Content of saved report */}
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ${
                                            isOpen
                                                ? "max-h-[2000px] mt-4"
                                                : "max-h-0"
                                        }`}
                                    >
                                        <div className="bg-gray-50 p-6 rounded-2xl mt-4 prose prose-lg max-w-none text-gray-700">
                                            <Markdown
                                                remarkPlugins={[remarkGfm]}
                                            >
                                                {report.content}
                                            </Markdown>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Login prompt if user is not logged in */}
            {!loginUser && isLoaded && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-xl shadow-xl w-96 text-center">
                        <h2 className="text-2xl font-bold mb-2">
                            Sign In Required
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Please sign in to continue.
                        </p>
                        <Link href="/auth/login">
                            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold uppercase tracking-wide">
                                Sign In
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
