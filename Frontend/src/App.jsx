import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';


function App() {
  return (
    <Router>
      <Routes>
        {/* Route pour la page d'accueil */}
        <Route path="/" element={<Home />} />

        {/* Placeholder pour les futures routes */}
        <Route path="/login" element={<div className="p-10 text-center text-2xl">Page de Connexion (À venir)</div>} />
        <Route path="/register" element={<div className="p-10 text-center text-2xl">Page d'Inscription (À venir)</div>} />
      </Routes>
    </Router>
  );
}

export default App;