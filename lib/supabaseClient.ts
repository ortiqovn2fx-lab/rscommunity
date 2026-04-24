import { createClient } from '@supabase/supabase-js';

// Используйте переменные окружения, которые начинаются с VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);