
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xyxfyqmmxbmdtxzvmcyl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5eGZ5cW1teGJtZHR4enZtY3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODkxNjMsImV4cCI6MjA4NDM2NTE2M30.JbXbM4t7WWXjQkKpzk1WZjZzhedJWBLx0BtrJQxjPmQ';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
