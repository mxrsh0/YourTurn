const SUPABASE_URL = "https://tegbuajtbzizphamtsiu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_5unFICeVKKvJ43W8OqNaPA_HwWcsxn8";

const { createClient } = window.supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
