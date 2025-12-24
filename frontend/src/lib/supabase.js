import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client only if env variables are provided
// This allows the app to load even without Supabase configured
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase environment variables not set. Authentication will not work.');
  // Create a mock client to prevent errors
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };

