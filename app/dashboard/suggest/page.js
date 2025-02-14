import { useEffect, useState } from "react";
import { getJobs, getUserProfile, saveRecommendations } from "@/lib/supabase";

export default function SuggestCareer() {
    const [careers, setCareers] = useState([]);
    const userId = "CURRENT_USER_ID"; // Replace with dynamic user authentication

    useEffect(() => {
        async function fetchAndSave() {
            const user = await getUserProfile(userId);
            const jobs = await getJobs();

            const recommendations = jobs.map(job => ({
                title: job.title,
                score: calculateCareerScore(user, job),
                requiredSkills: job.required_skills,
                skillGap: job.required_skills.length - user.skills.length
            })).sort((a, b) => b.score - a.score);

            await saveRecommendations(userId, recommendations);
            setCareers(recommendations);
        }
        fetchAndSave();
    }, []);

    return (
        <div className="career-suggestions">
            <h2>Recommended Careers</h2>
            {careers.map(career => (
                <div key={career.title} className="career-card">
                    <h3>{career.title}</h3>
                    <p><strong>Score:</strong> {career.score.toFixed(2)}</p>
                    <p><strong>Required Skills:</strong> {career.requiredSkills.join(", ")}</p>
                    <p><strong>Skill Gap:</strong> {career.skillGap}</p>
                </div>
            ))}
        </div>
    );
}

function calculateCareerScore(user, job) {
    const matchingSkills = user.skills.filter(skill => job.requiredSkills.includes(skill)).length;
    const skillGap = job.requiredSkills.length - matchingSkills;
    const demand = job.market_demand;
    const interest = user.interests.includes(job.category) ? 1 : 0;

    return (matchingSkills * 2) + (demand * 1.5) + (interest * 2) - (skillGap * 1);
}
