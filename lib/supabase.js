import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getJobs() {
    const { data, error } = await supabase.from("Jobs").select("*");
    if (error) console.error("Error fetching jobs:", error);
    return data;
}

export async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error && error.message !== "Auth session missing!") {
        console.error("Error fetching user:", error);
    }
    return data;
}

export async function getStudentProfiles() {
    const { data, error } = await supabase
        .from("users")
        .select("*, user_profiles(*)")
        .eq("role", "student");
    if (error) console.error("Error fetching user profiles:", error);
    return data;
}

export async function getUserProfiles() {
    const { data, error } = await supabase
        .from("users")
        .select("*, user_profiles(*)");
    if (error) console.error("Error fetching user profiles:", error);
    return data;
}

export async function getUserProfile(userId) {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .single();
    if (error) console.error("Error fetching user profile:", error);
    return data;
}

export async function saveRecommendations(userId, recommendations) {
    const formattedData = recommendations.map((rec) => ({
        user_id: userId,
        job_id: rec.title,
        score: rec.score,
    }));

    const { error } = await supabase
        .from("Career_Recommendations")
        .insert(formattedData);
    if (error) console.error("Error saving recommendations:", error);
}

export async function saveFeedbacks(employerId, studentId, content) {
    const { error } = await supabase
        .from("feedbacks")
        .insert({ employer_id: employerId, student_id: studentId, content });
    if (error) console.error("Error saving feedbacks:", error.message);
}

export async function getFeedbacks(studentId) {
    const { data, error } = await supabase
        .from("feedbacks")
        .select(
            "*, student:student_id(*, user_profiles(*)), employer:employer_id(*, employer_profiles(*))",
        )
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });
    if (error) console.error("Error fetching feedbacks:", error.message);
    return data;
}
