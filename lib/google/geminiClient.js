"use server";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// Access the environment variable - consider adding a check if it's missing in production
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

async function askGemini(prompt) {
  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  const result = await chatSession.sendMessage(prompt);

  return result.response.text();
}

export async function generateSummary(jobTitle) {
  const prompt =
    jobTitle && jobTitle !== ""
      ? `Given the job title '${jobTitle}', provide a summary for three experience levels: Senior, Mid Level, and Fresher. Each summary should be 3-4 lines long and include the experience level and the corresponding summary in JSON format. The output should be an array of objects, each containing 'experience_level' and 'summary' fields. Ensure the summaries are tailored to each experience level.`
      : `Create a 3-4 line summary about myself for my resume, emphasizing my personality, social skills, and interests outside of work. The output should be an array of JSON objects, each containing 'experience_level' and 'summary' fields representing Active, Average, and Lazy personality traits. Use example hobbies if needed but do not insert placeholders for me to fill in.`;

  const result = await askGemini(prompt);

  try {
    return JSON.parse(result);
  } catch (error) {
     console.error("Failed to parse summary JSON:", error, "Raw text:", result);
     // Return an empty array or throw a specific error depending on how the UI should handle it
     throw new Error("Failed to parse AI response for summary.");
  }
}

export async function generateEducationDescription(educationInfo) {
  const prompt = `Based on my education at ${educationInfo}, provide personal descriptions for three levels of curriculum activities: High Activity, Medium Activity, and Low Activity. Each description should be 3-4 lines long and written from my perspective, reflecting on past experiences. The output should be an array of JSON objects, each containing 'activity_level' and 'description' fields. Please include a subtle hint about my good (but not the best) results.`;

  const result = await askGemini(prompt);

  try {
    return JSON.parse(result);
  } catch (error) {
     console.error("Failed to parse education JSON:", error, "Raw text:", result);
     throw new Error("Failed to parse AI response for education description.");
  }
}

export async function generateExperienceDescription(experienceInfo) {
  const prompt = `Given that I have experience working as ${experienceInfo}, provide a summary of three levels of activities I performed in that position, preferably as a list: High Activity, Medium Activity, and Low Activity. Each summary should be 3-4 lines long and written from my perspective, reflecting on my past experiences in that workplace. The output should be an array of JSON objects, each containing 'activity_level' and 'description' fields. You can include <b>, <i>, <u>, <s>, <blockquote>, <ul>, <ol>, and <li> to further enhance the descriptions. Use example work samples if needed, but do not insert placeholders for me to fill in.`;

  const result = await askGemini(prompt);

   try {
    return JSON.parse(result);
  } catch (error) {
     console.error("Failed to parse experience JSON:", error, "Raw text:", result);
     throw new Error("Failed to parse AI response for experience description.");
  }
} 