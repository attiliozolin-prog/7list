import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Não quebra o app se as chaves faltarem, mas avisa no console
  console.warn('Faltam as variáveis de ambiente do Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)');
}

// Cria a conexão. O 'as string' garante ao TypeScript que as variáveis existem.
export const supabase = createClient(
  supabaseUrl as string, 
  supabaseAnonKey as string
);
