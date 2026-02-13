import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, ArrowRight, Loader2, UserPlus, LogIn } from 'lucide-react';
import logo from '../assets/logo.png';

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false); // Alterna entre Login e Cadastro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
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

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg('Erro ao conectar com Google: ' + error.message);
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50/50 p-4 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-200/40 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-rose-200/40 rounded-full blur-[100px]" />

      <div className="bg-white/80 backdrop-blur-lg p-8 md:p-10 rounded-3xl shadow-2xl max-w-md w-full border border-white relative z-10 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={logo} alt="7list Logo" className="h-20 w-auto" />
          </div>
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
            disabled={loading || loadingGoogle}
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

        {/* Separador "ou" */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/80 text-gray-500 font-medium">ou</span>
          </div>
        </div>

        {/* Botão Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || loadingGoogle}
          className="w-full py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-base border-2 border-gray-200 hover:border-gray-300 shadow-md transform transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loadingGoogle ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
                <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853" />
                <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC04" />
                <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.737 7.395 3.977 10 3.977z" fill="#EA4335" />
              </svg>
              Continuar com Google
            </>
          )}
        </button>

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
