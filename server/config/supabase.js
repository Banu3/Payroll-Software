import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://sample-payroll-app.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sample_anon_key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sample_service_role_key';

// Public Supabase client
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Backend Admin Client (Server-side ONLY with service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Default exported instance alias for convenience
export const supabase = supabaseAdmin;

export default supabaseAdmin;
