"use client";

import { getUser, getFeedbacks } from "@/lib/supabase";
import { useState, useEffect } from "react";

// FeedbackStudent component displays feedback given to the logged-in student by employers
export function FeedbackStudent() {
    const [loginUser, setLoginUser] = useState(null);
    const [submittedFeedback, setSubmittedFeedback] = useState([]);

    // Fetch the logged-in user's information when the component mounts
    useEffect(() => {
        async function fetchUser() {
            const { user } = await getUser();
            setLoginUser(user);
        }
        fetchUser().catch(console.error);
    }, []);

    // Fetch feedbacks related to the logged-in student once the user info is available
    useEffect(() => {
        async function fetchFeedbacks() {
            if (!loginUser) return;
            const data = await getFeedbacks(loginUser.id);
            setSubmittedFeedback(data);
        }
        fetchFeedbacks().catch(console.error);
    }, [loginUser]);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header section with title and description */}
            <header className="bg-black text-white py-16 text-center">
                <h1 className="text-5xl font-extrabold tracking-wide">
                    Employer <span className="text-red-400">Feedback</span>
                </h1>
                <p className="text-lg mt-4 text-gray-300 max-w-2xl mx-auto">
                    Gain insights from employers to enhance your career.
                </p>
            </header>

            {/* Section explaining the importance of feedback */}
            <section className="max-w-4xl mx-auto py-12 px-6 text-center">
                <h2 className="text-3xl font-semibold text-gray-900">
                    Why Employer Feedback Matters
                </h2>
                <p className="text-lg text-gray-700 mt-4 leading-relaxed">
                    Employer feedback helps you develop the skills needed to
                    succeed. Improve your employability and career readiness by
                    learning from professionals.
                </p>
            </section>

            {/* Feedback list section */}
            <section className="max-w-4xl mx-auto py-12 px-6">
                <h2 className="text-3xl font-semibold text-gray-900 text-center mb-6">
                    Submitted Feedback
                </h2>

                {/* If no feedback yet, show a message */}
                {submittedFeedback.length === 0 ? (
                    <p className="text-lg text-gray-600 text-center">
                        No feedback submitted yet.
                    </p>
                ) : (
                    // Display each feedback entry
                    <div className="space-y-6">
                        {submittedFeedback.map((feedback) => {
                            return (
                                <div
                                    key={feedback.feedback_id}
                                    className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
                                >
                                    {/* Feedback header with employer name and submission date */}
                                    <div className="flex flex-col md:flex-row justify-between">
                                        <h3 className="text-lg font-bold text-gray-800">
                                            Feedback from{" "}
                                            {feedback.employer?.employer_profiles?.at(
                                                0,
                                            )?.company_name ??
                                                "Unknown Company"}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {new Date(
                                                feedback.created_at,
                                            ).toLocaleString()}{" "}
                                            {/* Format timestamp */}
                                        </p>
                                    </div>

                                    {/* Feedback content with italic styling */}
                                    <p className="text-gray-900 mt-4 italic border-l-4 border-red-400 pl-4">
                                        “{feedback.content}”
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
