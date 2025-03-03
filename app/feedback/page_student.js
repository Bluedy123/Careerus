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
                    Student <span className="text-red-400">Feedback</span>
                </h1>
                <p className="text-lg mt-4 text-gray-300 max-w-3xl mx-auto">
                    Provide feedback on student profiles to help improve their
                    employability.
                </p>
            </header>

            {/* Why Feedback Matters Section */}
            <section className="max-w-6xl mx-auto py-16 px-6 text-center">
                <h2 className="text-3xl font-semibold text-gray-900">
                    Why Employer Feedback Matters
                </h2>
                <p className="text-lg text-gray-700 mt-4 leading-relaxed">
                    Your insights help students develop the skills they need to
                    succeed in the workforce. By providing feedback, you help
                    students improve their employability and career readiness.
                </p>
            </section>

            {/* Feedback Form */}
            <section className="bg-white py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-semibold text-gray-900">
                        Submit Feedback on a Student
                    </h2>
                    <p className="text-lg text-gray-700 mt-4">
                        Provide constructive feedback to help students improve.
                    </p>
                    <form onSubmit={handleSubmit} className="mt-6">
                        <input
                            type="text"
                            className="w-full p-4 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 text-black"
                            placeholder="Student Name"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                        />
                        <textarea
                            className="w-full p-4 mt-4 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 text-black"
                            rows="5"
                            placeholder="Provide feedback on the student..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="mt-4 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold uppercase tracking-wider hover:bg-red-600 transition"
                        >
                            Submit Feedback
                        </button>
                    </form>
                </div>
            </section>

            {/* Display Submitted Feedback */}
            {submittedFeedback.length > 0 && (
                <section className="max-w-6xl mx-auto py-16 px-6">
                    <h2 className="text-3xl font-semibold text-gray-900 text-center">
                        Recent Employer Feedback
                    </h2>
                    <div className="mt-8 space-y-6">
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
                </section>
            )}

            {/* Call to Action */}
            <section className="text-center py-16">
                <h2 className="text-3xl font-semibold text-gray-900">
                    Help Students Succeed
                </h2>
                <p className="text-lg text-gray-700 mt-4">
                    Your feedback helps students prepare for the real-world job
                    market.
                </p>
            </section>
        </div>
    );
}
