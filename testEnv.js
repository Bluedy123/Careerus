const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log("Checking Supabase credentials...");
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || "Not Loaded");
console.log("Supabase Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "Not Loaded");
console.log("JSearch API Key:", process.env.NEXT_PUBLIC_JSEARCH_API_KEY || "Not Loaded");
