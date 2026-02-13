import React from 'react';
import { Mail, Lock, LogIn, HeartPulse } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Fond décoratif identique */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-lg w-full max-w-md rounded-2xl shadow-2xl border border-white/50 p-8 relative z-10">

        <div className="text-center mb-8">
          <div className="inline-flex bg-teal-600 p-3 rounded-xl text-white mb-4 shadow-lg shadow-teal-600/20">
            <HeartPulse size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Bon retour parmi nous</h2>
          <p className="text-slate-500 mt-2 text-sm">Connectez-vous pour accéder à votre historique.</p>
        </div>

        <form className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              placeholder="Adresse email"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition bg-white/50"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition bg-white/50"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500" />
              Se souvenir de moi
            </label>
            <a href="#" className="hover:text-teal-600 transition">Mot de passe oublié ?</a>
          </div>

          <button
  type="button"
  onClick={() => navigate('/dashboard')}
  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-600/30 transition transform hover:scale-[1.02] flex justify-center items-center gap-2"
>
  Se connecter <LogIn size={18} />
</button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-teal-600 font-bold hover:underline">
            S'inscrire gratuitement
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;