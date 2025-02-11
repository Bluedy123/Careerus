import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getJobs() {
    const { data, error } = await supabase.from("Jobs").select("*");
    if (error) console.error("Error fetching jobs:", error);
    return data;
}

export async function getUserProfile(userId) {
    const { data, error } = await supabase.from("Users").select("*").eq("id", userId).single();
    if (error) console.error("Error fetching user profile:", error);
    return data;
}

export async function saveRecommendations(userId, recommendations) {
    const formattedData = recommendations.map(rec => ({
        user_id: userId,
        job_id: rec.title,
        score: rec.score
    }));

    const { error } = await supabase.from("Career_Recommendations").insert(formattedData);
    if (error) console.error("Error saving recommendations:", error);
}