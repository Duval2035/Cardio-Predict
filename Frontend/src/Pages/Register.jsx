import React from 'react';
import { User, Mail, Lock, ArrowRight, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Fond décoratif (Blobs) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-lg w-full max-w-md rounded-2xl shadow-2xl border border-white/50 p-8 relative z-10">

        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-teal-600 p-3 rounded-xl text-white mb-4 shadow-lg shadow-teal-600/20">
            <HeartPulse size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Créer votre compte</h2>
          <p className="text-slate-500 mt-2 text-sm">Commencez votre suivi cardiaque dès aujourd'hui.</p>
        </div>

        {/* Formulaire */}
        <form className="space-y-5">
          {/* Nom */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User size={18} />
            </div>
            <input
              type="text"
              placeholder="Nom complet"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition bg-white/50"
            />
          </div>

          {/* Email */}
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

          {/* Mot de passe */}
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

          {/* Bouton d'action */}
          <button type="button" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-600/30 transition transform hover:scale-[1.02] flex justify-center items-center gap-2">
            S'inscrire <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-teal-600 font-bold hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;