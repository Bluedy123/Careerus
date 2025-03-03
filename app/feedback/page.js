"use client";

import { useEffect, useState } from "react";

import { getUser, getUserProfile } from "@/lib/supabase";
import { FeedbackEmployer } from "./page_employer";
import { FeedbackStudent } from "./page_student";

export default function FeedbackPage() {
    const [userRole, setUserRole] = useState("");
    useEffect(() => {
        async function getUserRole() {
            const { user } = await getUser();
            const userprofile = await getUserProfile(user.id);
            setUserRole(userprofile.role);
        }
        getUserRole().catch((error) =>
            console.error("Error fetching user role:", error.message),
        );
    }, []);

    if (userRole === "employer") {
        return <FeedbackEmployer />;
    } else if (userRole === "student") {
        return <FeedbackStudent />;
    } else {
        return <div className="w-100 bg-emerald-500">Loading...</div>;
    }
}
