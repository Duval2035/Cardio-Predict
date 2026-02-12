import React from 'react';
import { HeartPulse, ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">

      {/* --- NAVBAR --- */}
      <nav className="w-full px-8 py-5 flex justify-between items-center bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="bg-teal-600 p-2 rounded-lg text-white">
            <HeartPulse size={28} />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-700 to-teal-500">
            CardioPredict
          </span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2.5 rounded-full font-medium text-teal-700 hover:bg-teal-50 transition">
            Se connecter
          </Link>
          <Link to="/register" className="px-5 py-2.5 rounded-full font-medium bg-teal-600 text-white shadow-lg shadow-teal-600/30 hover:bg-teal-700 hover:shadow-teal-600/40 transition flex items-center gap-2">
            Créer un compte <ArrowRight size={18} />
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION (Split Screen) --- */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-8 py-12 gap-12 max-w-7xl mx-auto">

        {/* Côté Gauche : Texte */}
        <div className="flex-1 space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-sm font-semibold">
            <Activity size={16} /> IA Médicale Certifiée
          </div>

          <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900">
            Anticipez votre santé <br/>
            <span className="text-teal-600">avant qu'il ne soit trop tard.</span>
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
            Une solution d'intelligence artificielle avancée pour estimer votre profil de risque cardiovasculaire en quelques secondes. Simple, rapide et sécurisé.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/register" className="px-8 py-4 rounded-xl bg-teal-600 text-white font-bold text-lg shadow-xl shadow-teal-600/20 hover:bg-teal-700 hover:scale-105 transition transform">
              Commencer l'analyse
            </Link>
            <a href="#how-it-works" className="px-8 py-4 rounded-xl bg-white text-slate-700 border border-slate-200 font-bold text-lg hover:bg-slate-50 transition">
              Comment ça marche ?
            </a>
          </div>

          <div className="flex items-center gap-8 pt-8 text-slate-400 text-sm font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-teal-500"/> Données sécurisées
            </div>
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-teal-500"/> Précision IA > 90%
            </div>
          </div>
        </div>

        {/* Côté Droit : Image avec effet Glassmorphism */}
        <div className="flex-1 relative w-full max-w-lg lg:max-w-xl">
            {/* Cercle décoratif en arrière plan */}
            <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                alt="Medical Analysis"
                className="w-full h-auto object-cover transform hover:scale-105 transition duration-700"
              />

              {/* Carte Flottante "Glass" */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/40 flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Analyse en temps réel</p>
                  <p className="text-lg font-bold text-slate-800">Résultat immédiat</p>
                </div>
              </div>
            </div>
        </div>

      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto text-center text-slate-500 text-sm">
        <p>© 2026 CardioPredict. Une solution d'aide à la décision médicale.</p>
        <p className="mt-2 text-xs text-slate-400">Attention : Cet outil ne remplace pas un avis médical professionnel.</p>
      </footer>
    </div>
  );
};

export default Home;