import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xgaclcviakwzbdzlvxwn.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYWNsY3ZpYWt3emJkemx2eHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyODg1NTAsImV4cCI6MjA3MTg2NDU1MH0.3SzXUFYUotgZCyY6HuvfTVEgxWqq7PvtGr2mrfc672Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
