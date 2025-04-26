import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Missing search query" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&num_pages=1`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.NEXT_PUBLIC_JSEARCH_API_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    });
    
    const data = await res.json();
    
    console.log("🔥 JSearch API raw data:", data); // <-- Add this
    

    const careers = (data.data || []).map((job) => ({
      title: job.job_title,
      id: job.job_id, // Using job_id instead of code now
    }));

    return NextResponse.json({ careers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch careers." }, { status: 500 });
  }
}
