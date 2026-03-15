import React, { useState } from 'react';
import { Mail, Lock, LogIn, HeartPulse } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token); // On sauvegarde la clé
        localStorage.setItem('userName', data.user.name);
        navigate('/dashboard');
      } else {
        setError("Email ou mot de passe incorrect");
      }
    } catch (err) {
      setError("Impossible de contacter le serveur Laravel.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-lg w-full max-w-md rounded-2xl shadow-2xl p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex bg-teal-600 p-3 rounded-xl text-white mb-4"><HeartPulse size={32} /></div>
          <h2 className="text-2xl font-bold text-slate-800">Bon retour</h2>
        </div>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Mail size={18} /></div>
            <input type="email" placeholder="Adresse email" required
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-teal-200 outline-none" />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Lock size={18} /></div>
            <input type="password" placeholder="Mot de passe" required
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-teal-200 outline-none" />
          </div>

          <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
            Se connecter <LogIn size={18} />
          </button>
        </form>
        <div className="mt-8 text-center text-sm text-slate-500">
          Pas encore de compte ? <Link to="/register" className="text-teal-600 font-bold hover:underline">S'inscrire</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;