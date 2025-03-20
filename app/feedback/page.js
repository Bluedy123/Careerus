"use client";

import { useEffect, useState } from "react";

import { getUser, getUserProfile } from "@/lib/supabase";
import { FeedbackEmployer } from "./page_employer";
import { FeedbackStudent } from "./page_student";
import Link from "next/link";

export default function FeedbackPage() {
    const [userRole, setUserRole] = useState("");

    useEffect(() => {
        async function getUserRole() {
            const { user } = await getUser();
            if (!user) return;
            const userProfile = await getUserProfile(user.id);
            setUserRole(userProfile.role);
        }
        getUserRole().catch((error) =>
            console.error("Error fetching user role:", error),
        );
    }, []);

    if (userRole === "employer") {
        return <FeedbackEmployer />;
    } else if (userRole === "student") {
        return <FeedbackStudent />;
    } else {
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
