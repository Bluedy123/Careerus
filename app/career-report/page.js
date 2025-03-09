"use client";

import { useState, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function GenerateCareerReport() {
    const [report, setReport] = useState("");

    // Initialize the Google Generative AI client using an API key from environment variables
    const genAI = new GoogleGenerativeAI(
        process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    );

    // Select the AI model to be used for text generation
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Define the prompt to generate the career report
    const prompt = `Generate career report for Kyongsu Kang, who is a university student, in 250 words.
    This student's major is Computer Science, and is mainly studying Python. 
    Kyongsu wants to be Software engineer.`;

    useEffect(() => {
        // Fetch the career report using AI model
        async function getCareerReport() {
            try {
                // Generate content using the AI model
                const result = await model.generateContent(prompt);
                setReport(result.response.text);
            } catch (error) {
                console.error("Error generating career report:", error);
                setReport("Failed to generate report.");
            }
        }
        getCareerReport();
    }, []);

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Header */}
            <header className="bg-black text-white py-20 text-center">
                <h1 className="text-5xl font-extrabold uppercase tracking-wide">
                    Career <span className="text-red-400">Report</span>
                </h1>
                <p className="text-lg mt-4 text-gray-300 max-w-3xl mx-auto">
                    Insights based on your major and skills
                </p>
            </header>

            {/* Report Section */}
            <section className="max-w-4xl mx-auto py-16 px-6">
                <h2 className="text-3xl font-semibold text-gray-900 text-center">
                    Career Personalized Report
                </h2>
                <div className="bg-white p-6 rounded-lg shadow-lg text-left leading-relaxed prose prose-lg mt-8">
                    {/* Render the AI-generated report as Markdown */}
                    <Markdown remarkPlugins={[remarkGfm]}>{report}</Markdown>
                </div>
            </section>
        </div>
    );
}
