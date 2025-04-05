"use client";

import { useEffect, useState } from "react";
import { getUser, getUserProfile } from "@/lib/supabase"; // Supabase functions to get user and their profile
import { FeedbackEmployer } from "./page_employer"; // Employer-specific feedback component
import { FeedbackStudent } from "./page_student"; // Student-specific feedback component
import Link from "next/link"; // For navigation

export default function FeedbackPage() {
    const [userRole, setUserRole] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // fetch the user role on component mount
    useEffect(() => {
        async function getUserRole() {
            try {
                // Show loading indicator
                setIsLoading(true);
                // Get currently logged-in user
                const { user } = await getUser();

                if (!user) return;
                const userProfile = await getUserProfile(user.id);
                setUserRole(userProfile.role);
            } catch (error) {
                console.error("Error fetching user role:", error);
            } finally {
                // Stop loading indicator
                setIsLoading(false);
            }
        }

        getUserRole();
    }, []);

    // If data is still loading, show a loading screen
    if (isLoading) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                    <p className="text-gray-700">Loading...</p>
                </div>
            </div>
        );
    }

    // If the user is an employer, show employer feedback page
    if (userRole === "employer") {
        return <FeedbackEmployer />;
    }
    // If the user is a student, show student feedback page
    else if (userRole === "student") {
        return <FeedbackStudent />;
    }
    // If no valid user role is found (e.g. not logged in), prompt for sign in
    else {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center w-96 z-30">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Sign In Required
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Please sign in to view feedbacks.
                    </p>
                    <Link href="/auth/login">
                        <button className="mt-4 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold uppercase tracking-wider hover:bg-red-600 transition">
                            Sign In
                        </button>
                    </Link>
                </div>
            </div>
        );
    }
}
