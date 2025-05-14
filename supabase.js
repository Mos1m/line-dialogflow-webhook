const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ibmgrsogrjkyzztrslcg.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlibWdyc29ncmpreXp6dHJzbGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxOTQ5MDAsImV4cCI6MjA2Mjc3MDkwMH0.FfZLcSHbSWQp3CiLIddwVEo0bE9BsUm9b83LUWwDkGE";

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
