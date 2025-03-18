"use client";

import { useState } from "react";

export function FeedbackStudent() {
    const [studentName, setStudentName] = useState("");
    const [feedback, setFeedback] = useState("");
    const [submittedFeedback, setSubmittedFeedback] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (studentName.trim() !== "" && feedback.trim() !== "") {
            setSubmittedFeedback([
                ...submittedFeedback,
                { studentName, feedback },
            ]);
            setStudentName(""); // Clear student name field
            setFeedback(""); // Clear feedback field
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Header */}
            <header className="bg-black text-white py-20 text-center">
                <h1 className="text-5xl font-extrabold uppercase tracking-wide">
                    Employer <span className="text-red-400">Feedback</span>
                </h1>
                <p className="text-lg mt-4 text-gray-300 max-w-3xl mx-auto">
                    Get feedback from employers for your future.
                </p>
            </header>
            {/* Why Feedback Matters Section */}
            <section className="max-w-6xl mx-auto py-16 px-6 text-center">
                <h2 className="text-3xl font-semibold text-gray-900">
                    Why Employer Feedback Matters
                </h2>
                <p className="text-lg text-gray-700 mt-4 leading-relaxed">
                    Employer feedback helps you develop the skills you need to
                    succeed in the workforce. By receiving feedback, you can
                    improve your employability and career readiness.
                </p>
            </section>
            {/* Display Submitted Feedback */}
            <section className="max-w-6xl mx-auto py-16 px-6">
                <h2 className="text-3xl font-semibold text-gray-900 text-center">
                    Submitted feedback
                </h2>
                {/* Check if there any submitted feedback */}
                {submittedFeedback.length === 0 ? (
                    <p className="text-lg •text-gray-600 text-center mt-4">
                        No feedback submitted yet.
                    </p>
                ) : (
                    <div className="mt-8 space-y-6">
                        {/* Loop through the submitted feedback array and display each entry */}
                        {submittedFeedback.map((entry, index) => (
                            <div
                                key={index}
                                className="bg-gray-200 p-6 rounded-lg shadow-md"
                            >
                                <h3 className="text-lg font-bold text-gray-800">
                                    Feedback on {entry.studentName}
                                </h3>
                                <p className="text-gray-800 mt-2 italic">
                                    "{entry.feedback}"
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
