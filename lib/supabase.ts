import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// supabase Tse Hang 使用github登录，databse password xNiPEQJbRLtNci9l
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
