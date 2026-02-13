import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Login } from './components/Login';
import { PublicProfile } from './components/PublicProfile';
import { Dashboard } from './pages/Dashboard';
import { Explore } from './pages/Explore';
import { Rankings } from './pages/Rankings';
import { Loader2 } from 'lucide-react';

// --- COMPONENTE PRINCIPAL (Roteador) ---
const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-500" /></div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Raiz: Se logado -> Dashboard. Se não -> Login */}
        <Route path="/" element={session ? <Dashboard session={session} onLogout={() => supabase.auth.signOut()} /> : <Login />} />

        {/* Rotas Públicas */}
        <Route path="/explore" element={<Explore />} />
        <Route path="/rankings" element={<Rankings />} />

        {/* Rota Pública de Perfil: /qualquer-coisa (Ex: /joao) - DEVE SER A ÚLTIMA */}
        <Route path="/:username" element={<PublicProfile />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
