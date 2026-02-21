import React, { useState, useEffect } from 'react';
import {
  Activity, Clock, Mail, Download,
  ChevronRight, HeartPulse, User, LogOut, BookOpen, AlertCircle, FileText, CheckCircle
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Dashboard = () => {
  // Par défaut, on affiche le guide
  const [activeTab, setActiveTab] = useState('guide');
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [riskFactors, setRiskFactors] = useState([]);

  const [historyData, setHistoryData] = useState([]);

  // Fonction pour charger l'historique depuis Laravel
  const fetchHistory = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8001/api/history');
      const data = await response.json();

      // On formate la date pour que le graphique soit joli (ex: "13 Fév")
      const formattedData = data.map(item => {
        const dateObj = new Date(item.created_at);
        return {
          date: dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          score: item.risk_score
        };
      });

      setHistoryData(formattedData);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique", error);
    }
  };

  // Se lance tout seul quand on ouvre la page
  useEffect(() => {
    fetchHistory();
  }, []);

  // 1. GESTION DES DONNÉES DU FORMULAIRE
  const [formData, setFormData] = useState({
    age: '', sex: '1', cp: '0', trestbps: '', chol: '',
    fbs: '0', restecg: '0', thalch: '', exang: '0',
    oldpeak: '0', slope: '0', ca: '0', thal: '1',
    smoker: '0'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calcule visuellement l'impact des facteurs pour le graphique
  const generateRiskFactors = (data) => {
    return [
      { name: 'Âge', impact: data.age > 55 ? 80 : (data.age > 40 ? 50 : 20) },
      { name: 'Tension', impact: data.trestbps > 140 ? 90 : (data.trestbps > 120 ? 60 : 30) },
      { name: 'Cholestérol', impact: data.chol > 240 ? 85 : (data.chol > 200 ? 55 : 25) },
      { name: 'Tabagisme', impact: data.smoker === '1' ? 95 : 5 },
      { name: 'Fréq. Cardiaque', impact: data.thalch < 100 ? 70 : 30 }
    ];
  };

  // 2. ENVOI DES DONNÉES À LARAVEL
  const handleAnalyze = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // On retire "smoker" car l'IA ne le connait pas
      const { smoker, ...dataForAI } = formData;

      const dataToSend = {};
      for (const key in dataForAI) {
        dataToSend[key] = Number(dataForAI[key]);
      }

      const response = await fetch('http://127.0.0.1:8001/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (response.ok) {
        setResultData(data);
        setRiskFactors(generateRiskFactors(formData));
        fetchHistory(); // <-- Mise à jour automatique du graphique d'historique
        setActiveTab('results');
      } else {
        alert("Erreur du serveur : " + (data.message || "Vérifiez vos données."));
      }
    } catch (error) {
      console.error("Erreur :", error);
      alert("Erreur de connexion avec l'API. (Port 8001)");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. FONCTION DE TÉLÉCHARGEMENT PDF DÉTAILLÉ
  const downloadPDF = () => {
    const input = document.getElementById('pdf-content');

    // On ajoute un peu de style pour le PDF (fond blanc forcé)
    input.style.backgroundColor = 'white';

    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Bilan_CardioPredict.pdf');

      input.style.backgroundColor = ''; // On remet normal
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-teal-600 p-2 rounded-lg text-white">
            <HeartPulse size={24} />
          </div>
          <span className="text-xl font-bold text-slate-800">CardioPredict</span>
        </div>

        <div className="p-4 flex-1 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-2">Navigation</p>

          <button onClick={() => setActiveTab('guide')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'guide' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}>
            <BookOpen size={20} /> Guide d'utilisation
          </button>

          <button onClick={() => setActiveTab('new_test')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'new_test' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Activity size={20} /> Nouvelle Analyse
          </button>

          <button onClick={() => setActiveTab('results')} disabled={!resultData} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'results' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'} disabled:opacity-50 disabled:cursor-not-allowed`}>
            <FileText size={20} /> Rapport Actuel
          </button>

          <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'history' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Clock size={20} /> Mon Historique
          </button>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500"><User size={16} /></div>
          <div className="flex-1"><p className="text-sm font-semibold">Patient Test</p></div>
          <LogOut size={18} className="text-slate-400 hover:text-red-500 cursor-pointer" />
        </div>
      </aside>

      {/* --- CONTENU PRINCIPAL --- */}
      <main className="flex-1 p-8 overflow-y-auto w-full">

        {/* ONGLET 1 : LE GUIDE */}
        {activeTab === 'guide' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            <div className="bg-teal-600 text-white rounded-2xl p-10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3"></div>
              <h1 className="text-3xl font-bold mb-4 relative z-10">Bienvenue sur CardioPredict</h1>
              <p className="text-teal-100 text-lg relative z-10">Votre assistant intelligent pour la prévention des maladies cardiovasculaires.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-8">Comment ça marche ?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">1</div>
                  <h3 className="font-semibold text-lg">Saisissez vos données</h3>
                  <p className="text-slate-500 text-sm">Remplissez le formulaire clinique avec vos constantes (tension, cholestérol...).</p>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold"><Activity size={30} /></div>
                  <h3 className="font-semibold text-lg">Analyse IA</h3>
                  <p className="text-slate-500 text-sm">Notre algorithme, entraîné sur des milliers de cas médicaux, calcule votre risque.</p>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold"><FileText size={30} /></div>
                  <h3 className="font-semibold text-lg">Obtenez votre rapport</h3>
                  <p className="text-slate-500 text-sm">Téléchargez un PDF détaillé avec des graphiques d'impact pour votre médecin.</p>
                </div>
              </div>
              <div className="mt-10 text-center">
                <button onClick={() => setActiveTab('new_test')} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition">
                  Commencer mon analyse
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 2 : LE FORMULAIRE */}
        {activeTab === 'new_test' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-4xl mx-auto animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Nouvelle Évaluation</h2>
            <p className="text-slate-500 mb-8">Veuillez remplir les informations cliniques avec précision.</p>

            <form onSubmit={handleAnalyze} className="space-y-8">

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><User size={18}/> Informations Générales</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Âge</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:ring-teal-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Sexe</label>
                    <select name="sex" value={formData.sex} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 outline-none">
                      <option value="1">Homme</option>
                      <option value="0">Femme</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Fumeur</label>
                    <select name="smoker" value={formData.smoker} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 outline-none">
                      <option value="0">Non</option>
                      <option value="1">Oui</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Activity size={18}/> Constantes Médicales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Tension au repos (mm Hg)</label>
                    <input type="number" name="trestbps" value={formData.trestbps} onChange={handleChange} required placeholder="Ex: 120" className="w-full p-3 rounded-xl border border-slate-200 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Cholestérol (mg/dl)</label>
                    <input type="number" name="chol" value={formData.chol} onChange={handleChange} required placeholder="Ex: 200" className="w-full p-3 rounded-xl border border-slate-200 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Fréq. Cardiaque Max (thalch)</label>
                    <input type="number" name="thalch" value={formData.thalch} onChange={handleChange} required placeholder="Ex: 150" className="w-full p-3 rounded-xl border border-slate-200 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Type de Douleur Thoracique</label>
                    <select name="cp" value={formData.cp} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 outline-none">
                      <option value="0">Aucune (Asymptomatique)</option>
                      <option value="1">Angine typique</option>
                      <option value="2">Angine atypique</option>
                      <option value="3">Douleur non angineuse</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Champs cachés requis par l'IA */}
              <div className="hidden">
                 <input name="fbs" value={formData.fbs} onChange={handleChange} />
                 <input name="restecg" value={formData.restecg} onChange={handleChange} />
                 <input name="exang" value={formData.exang} onChange={handleChange} />
                 <input name="oldpeak" value={formData.oldpeak} onChange={handleChange} />
                 <input name="slope" value={formData.slope} onChange={handleChange} />
                 <input name="ca" value={formData.ca} onChange={handleChange} />
                 <input name="thal" value={formData.thal} onChange={handleChange} />
              </div>

              <div className="pt-2 flex justify-end">
                <button type="submit" disabled={isLoading} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-2 transition disabled:opacity-70">
                  {isLoading ? 'Calcul en cours...' : 'Générer le Bilan IA'} <ChevronRight size={20} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ONGLET 3 : RÉSULTATS & PDF */}
        {activeTab === 'results' && resultData && (
          <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">

            <div className="flex justify-end gap-3 mb-2">
               <button onClick={downloadPDF} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-medium transition shadow-lg">
                  <Download size={18} /> Exporter en PDF
                </button>
            </div>

            {/* --- LA ZONE CAPTURÉE DANS LE PDF --- */}
            <div id="pdf-content" className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200">

              {/* En-tête du Rapport */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-800">Rapport d'Analyse IA</h2>
                  <p className="text-slate-500 mt-1">Généré par CardioPredict</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">Date : {new Date().toLocaleDateString('fr-FR')}</p>
                  <p className="text-sm text-slate-500">Patient ID : #9842</p>
                </div>
              </div>

              {/* Le Score Principal */}
              <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center mb-8 border border-slate-100">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Score de Risque Estimé</p>
                <div className="flex items-center gap-4">
                  <span className={`text-6xl font-black ${resultData.data.risk_score > 50 ? 'text-red-600' : 'text-teal-600'}`}>
                    {resultData.data.risk_score}%
                  </span>
                </div>
                <div className={`mt-4 px-6 py-2 rounded-full font-bold flex items-center gap-2 ${resultData.data.risk_score > 50 ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-700'}`}>
                  {resultData.data.risk_score > 50 ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                  {resultData.ai_message}
                </div>
              </div>

              {/* Tableau : Paramètres Renseignés */}
              <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Paramètres Cliniques Renseignés</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-sm">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="block text-slate-500 mb-1">Âge</span>
                  <span className="font-bold text-slate-800 text-lg">{formData.age} ans</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="block text-slate-500 mb-1">Sexe</span>
                  <span className="font-bold text-slate-800 text-lg">{formData.sex === '1' ? 'Homme' : 'Femme'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="block text-slate-500 mb-1">Tension</span>
                  <span className="font-bold text-slate-800 text-lg">{formData.trestbps} mmHg</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="block text-slate-500 mb-1">Cholestérol</span>
                  <span className="font-bold text-slate-800 text-lg">{formData.chol} mg/dl</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="block text-slate-500 mb-1">Fréq. Cardiaque Max</span>
                  <span className="font-bold text-slate-800 text-lg">{formData.thalch} bpm</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="block text-slate-500 mb-1">Fumeur</span>
                  <span className="font-bold text-slate-800 text-lg">{formData.smoker === '1' ? 'Oui' : 'Non'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2">
                  <span className="block text-slate-500 mb-1">Douleur Thoracique</span>
                  <span className="font-bold text-slate-800 text-lg">
                    {formData.cp === '0' ? 'Aucune' : formData.cp === '1' ? 'Angine typique' : 'Autre'}
                  </span>
                </div>
              </div>

              {/* Graphique : Impact des facteurs */}
              <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">Impact estimé de vos facteurs de risque</h3>
              <div className="h-64 w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskFactors} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontWeight: 600 }} />
                    <RechartsTooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="impact" fill="#0D9488" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>
        )}

        {/* ONGLET 4 : HISTORIQUE SIMPLE */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-4xl mx-auto animate-fade-in-up">
             <h2 className="text-2xl font-bold text-slate-900 mb-6">Historique de vos analyses</h2>
             <div className="h-80 w-full mt-8">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="score" stroke="#0D9488" strokeWidth={4} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;