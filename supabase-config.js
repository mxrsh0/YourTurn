const SUPABASE_URL = "https://ulcsekslggmqjpyehdrq.supabase.co";
// Legacy anon key is used here for broad compatibility with the CDN-loaded Supabase JS client.
// This key is intentionally public; database access is protected by Supabase RLS.
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsY3Nla3NsZ2dtcWpweWVoZHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNzAxMTEsImV4cCI6MjEwMjc0NjExMX0.MUGtfuw3t7sjRJJryD-iysMMLKn5AX00OOUxXZLxZ6I";

const { createClient } = window.supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
