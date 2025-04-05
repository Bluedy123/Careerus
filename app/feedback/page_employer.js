"use client";

import { getStudentProfiles, saveFeedbacks, getUser } from "@/lib/supabase";
import { useState, useEffect } from "react";

import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

export function FeedbackEmployer() {
    const [loginUser, setLoginUser] = useState(null);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [submittedFeedback, setSubmittedFeedback] = useState([]);

    // Fetch student profiles when the component mounts
    useEffect(() => {
        async function getStudents() {
            const users = await getStudentProfiles();
            setStudents(users);
        }
        getStudents().catch((error) =>
            console.error("Error fetching students:", error.message),
        );
    }, []);

    useEffect(() => {
        async function getLoginUser() {
            const { user } = await getUser();
            setLoginUser(user);
        }
        getLoginUser().catch((error) =>
            console.error("Error fetching user:", error.message),
        );
    }, []);

    // Handle feedback submission
    async function handleSubmit(e) {
        e.preventDefault();

        // Ensure a student is selected and feedback is not empty
        if (selectedStudent && feedback.trim() !== "") {
            // Add the new feedback entry to the submittedFeedback array
            setSubmittedFeedback([
                ...submittedFeedback,
                { selectedStudent, feedback },
            ]);
            setFeedback("");

            // Save feedback to the backend using Supabase function
            await saveFeedbacks(
                loginUser.id,
                selectedStudent.user_id,
                feedback,
            );
        }
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Header */}
            <header className="bg-black text-white py-20 text-center">
                <h1 className="text-5xl font-extrabold uppercase tracking-wide">
                    Employer <span className="text-red-400">Feedback</span>
                </h1>
                <p className="text-lg mt-4 text-gray-300 max-w-3xl mx-auto">
                    Provide feedback students to help improve their
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
                        {/* Student Selection Autocomplete */}
                        <Autocomplete
                            disablePortal
                            options={students} // Provide list of students as options
                            getOptionLabel={(student) => student.email}
                            sx={{ width: 1 }}
                            renderInput={(params) => (
                                <TextField {...params} label="Student Email" />
                            )}
                            onChange={(e, newValue) =>
                                setSelectedStudent(newValue)
                            }
                        />
                        {/* Display student's fullname */}
                        {selectedStudent && (
                            <div className="mt-3 p-2 bg-gray-100 rounded-md shadow-sm text-gray-800 text-sm">
                                <span className="font-semibold">
                                    Student&apos;s Full Name:
                                </span>
                                <span className="ml-1">
                                    {
                                        selectedStudent?.user_profiles[0]
                                            .full_name
                                    }
                                </span>
                            </div>
                        )}
                        {/* Feedback input field */}
                        <textarea
                            className="w-full p-4 mt-4 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2
                        focus:ring-red-400 text-black"
                            rows="5"
                            placeholder="Provide feedback on the student..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                        {/* Submit button */}
                        <button
                            type="submit"
                            className="mt-4 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold uppercase tracking-wider hover:bg-red-600 transition"
                        >
                            Submit Feedback
                        </button>
                    </form>
                </div>
            </section>

            {/* History of feedback you submitted */}
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
                                    Feedback on {entry.selectedStudent?.email}
                                </h3>
                                <p className="text-gray-800 mt-2 italic">
                                    &quot;{entry.feedback}&quot;
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
