"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Profile() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                return; // Let the UI handle the not logged in state
            }

            setUser(user);

            // Get user role
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("role")
                .eq("user_id", user.id)
                .single();

            if (userError) throw userError;
            setUserRole(userData.role);

            // Get profile based on role
            if (userData.role === "student") {
                const { data: profile, error: profileError } = await supabase
                    .from("user_profiles")
                    .select("*")
                    .eq("user_id", user.id)
                    .single();

                if (profileError) throw profileError;
                setProfileData(profile);
            } else {
                const { data: profile, error: profileError } = await supabase
                    .from("employer_profiles")
                    .select("*")
                    .eq("user_id", user.id)
                    .single();

                if (profileError) throw profileError;
                setProfileData(profile);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            router.push("/auth/login");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Loading profile...</div>
            </div>
        );
    }

    const isLoggedIn = !!user;

    return (
        <div className="relative bg-gray-100 min-h-screen">
            {/* Header */}
            <header className="bg-black text-white py-20 text-center z-20 relative">
                <h1 className="text-5xl font-extrabold uppercase tracking-wide">
                    My <span className="text-red-400">Profile</span>
                </h1>
                <p className="text-lg mt-4 text-gray-300 max-w-3xl mx-auto">
                    Showcase your skills and career journey.
                </p>
            </header>

            {/* Content Wrapper */}
            <div className={`relative ${!isLoggedIn ? "blur-sm" : ""}`}>
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row py-10 px-6">
                    {/* Sidebar */}
                    <aside className="md:w-1/3 bg-white shadow-lg rounded-lg p-6">
                        {/* Profile Image */}
                        <div className="text-center">
                            <Image
                                src="/profile-placeholder.jpg"
                                alt="Profile Picture"
                                width={100}
                                height={100}
                                className="rounded-full mx-auto"
                            />
                            <h2 className="text-2xl font-bold mt-4">
                                {userRole === "student"
                                    ? profileData?.full_name
                                    : profileData?.company_name}
                            </h2>
                            <p className="text-gray-600">{user?.email}</p>
                        </div>

                        {/* Profile Info */}
                        <div className="mt-6 border-t border-gray-300 pt-4">
                            {userRole === "student" ? (
                                <>
                                    <p className="text-gray-700 font-semibold">
                                        Education:{" "}
                                        <span className="text-gray-600">
                                            {profileData?.education_level}
                                        </span>
                                    </p>
                                    <p className="text-gray-700 font-semibold mt-2">
                                        Field:{" "}
                                        <span className="text-gray-600">
                                            {profileData?.field_of_study}
                                        </span>
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-700 font-semibold">
                                        Industry:{" "}
                                        <span className="text-gray-600">
                                            {profileData?.industry}
                                        </span>
                                    </p>
                                    <p className="text-gray-700 font-semibold mt-2">
                                        Location:{" "}
                                        <span className="text-gray-600">
                                            {profileData?.location}
                                        </span>
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Sidebar Links */}
                        <div className="mt-6 space-y-4">
                            <SidebarLink title="Profile Overview" />
                            {userRole === "student" ? (
                                <>
                                    <SidebarLink title="Skills" />
                                    <SidebarLink title="Career Preferences" />
                                    <SidebarLink title="Saved Recommendations" />
                                    <SidebarLink
                                        title="Generate Career Report"
                                        href="/career-report"
                                    />
                                </>
                            ) : (
                                <>
                                    <SidebarLink title="Job Listings" />
                                    <SidebarLink title="Applications" />
                                    <SidebarLink title="Company Profile" />
                                </>
                            )}
                            <button
                                onClick={handleLogout}
                                className="w-full text-left text-red-600 font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition"
                            >
                                Sign Out
                            </button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="md:w-2/3 md:ml-6 bg-white shadow-lg rounded-lg p-6 mt-6 md:mt-0">
                        <h2 className="text-3xl font-semibold text-gray-900">
                            Profile Overview
                        </h2>

                        {/* Bio Section */}
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold text-gray-800">
                                About
                            </h3>
                            <p className="text-gray-700 mt-2">
                                {profileData?.bio || "No bio provided"}
                            </p>
                        </div>

                        {/* Skills/Details Section */}
                        {userRole === "student" ? (
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold text-gray-800">
                                    Skills
                                </h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {profileData?.skills?.map(
                                        (skill, index) => (
                                            <span
                                                key={index}
                                                className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ),
                                    )}
                                </div>

                                <h3 className="text-xl font-semibold text-gray-800 mt-6">
                                    Interests
                                </h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {profileData?.interests?.map(
                                        (interest, index) => (
                                            <span
                                                key={index}
                                                className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm"
                                            >
                                                {interest}
                                            </span>
                                        ),
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold text-gray-800">
                                    Company Details
                                </h3>
                                <div className="mt-2 space-y-2">
                                    <p className="text-gray-700">
                                        <span className="font-semibold">
                                            Size:
                                        </span>{" "}
                                        {profileData?.company_size}
                                    </p>
                                    <p className="text-gray-700">
                                        <span className="font-semibold">
                                            Website:
                                        </span>{" "}
                                        <a
                                            href={profileData?.website}
                                            className="text-blue-600 hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {profileData?.website}
                                        </a>
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <Link href="auth/edit-profile">
                                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    Edit Profile
                                </button>
                            </Link>
                        </div>
                    </main>
                </div>
            </div>

            {/* Login Popup Modal */}
            {!isLoggedIn && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center w-96 z-30">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Sign In Required
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Please sign in to view your profile.
                        </p>
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

// Sidebar Link Component
function SidebarLink({ title, href = "" }) {
    return (
        <Link
            href={href}
            className="block w-full text-left text-gray-800 font-semibold px-4 py-2 rounded-lg border-l-4 border-red-400 hover:bg-gray-200 transition"
        >
            {title}
        </Link>
    );
}
