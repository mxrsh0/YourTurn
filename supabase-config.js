const SUPABASE_URL = "https://ulcsekslggmqjpyehdrq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_9LjkReSpuSRRVIkNaLlsgw_Mgot8h5e";

const { createClient } = window.supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
