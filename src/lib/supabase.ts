import { createClient } from '@supabase/supabase-js';

// Puxando as chaves do nosso arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Criando e exportando a conexão
export const supabase = createClient(supabaseUrl, supabaseAnonKey);