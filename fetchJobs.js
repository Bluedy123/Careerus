require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Supabase Setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// JSearch API Setup
const JSEARCH_API_KEY = process.env.NEXT_PUBLIC_JSEARCH_API_KEY;
const JSEARCH_URL = 'https://jsearch.p.rapidapi.com/search';

// Fetch job market data from JSearch API
async function fetchJobData() {
    try {
        const response = await axios.get(JSEARCH_URL, {
            params: { query: 'Software Engineer', num_pages: 1 },
            headers: {
                'X-RapidAPI-Key': JSEARCH_API_KEY,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        });

        const jobs = response.data.data.map(job => ({
            job_title: job.job_title,
            industry: job.employer_name || 'Unknown Industry',
            location: job.job_city || 'Unknown Location',
            average_salary: job.estimated_salary || null,
            demand_score: Math.floor(Math.random() * 100), // Placeholder for demand metric
            required_skills: job.job_required_skills || [],
            last_updated: new Date().toISOString()
        }));

        console.log('Fetched Jobs:', jobs);
        return jobs;
    } catch (error) {
        console.error('Error fetching job data:', error);
        return [];
    }
}

// Store data in Supabase
async function storeJobData() {
    const jobs = await fetchJobData();

    if (jobs.length === 0) {
        console.log('No job data available.');
        return;
    }

    const { data, error } = await supabase.from('job_market_trends').insert(jobs);

    if (error) {
        console.error('Error inserting into Supabase:', error);
    } else {
        console.log('Successfully inserted job data into Supabase:', data);
    }
}

// Run script
storeJobData();
