import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Sparkles, Mail, Lock, ArrowRight, Loader2, UserPlus, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false); // Alterna entre Login e Cadastro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        // --- CADASTRAR ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // Se deu certo, o Supabase já loga automaticamente (se o email confirm estiver off)
      } else {
        // --- ENTRAR ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      setErrorMsg(error.message === 'Invalid login credentials' 
        ? 'E-mail ou senha incorretos.' 
        : error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50/50 p-4 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-200/40 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-rose-200/40 rounded-full blur-[100px]" />

      <div className="bg-white/80 backdrop-blur-lg p-8 md:p-10 rounded-3xl shadow-2xl max-w-md w-full border border-white relative z-10 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500 text-white mb-4 shadow-lg shadow-brand-500/30">
            <Sparkles size={24} />
          </div>
          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">7list</h1>
          <p className="text-gray-500">
            {isSignUp ? 'Crie sua estante cultural.' : 'Sua curadoria em um único link.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {/* E-mail */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-gray-900 font-medium"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-gray-900 font-medium"
              />
            </div>
          </div>

          {/* Mensagem de Erro */}
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg text-center font-medium animate-in fade-in slide-in-from-top-2">
              {errorMsg}
            </div>
          )}

          {/* Botão Principal */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-brand-500/30 transform transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : isSignUp ? (
              <>Criar Conta Grátis <ArrowRight size={20} /></>
            ) : (
              <>Entrar na minha 7list <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        {/* Alternador Login/Cadastro */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
            className="text-gray-500 hover:text-brand-600 font-medium text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            {isSignUp ? (
              <>Já tem uma conta? <span className="font-bold underline">Fazer Login</span></>
            ) : (
              <>Não tem conta? <span className="font-bold underline">Cadastre-se</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
