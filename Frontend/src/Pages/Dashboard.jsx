import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Clock, Mail, Download,
  ChevronRight, ChevronLeft, HeartPulse, User, LogOut, BookOpen, AlertCircle, FileText, CheckCircle, Stethoscope, TestTube, FileHeart
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Dashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Patient';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const [activeTab, setActiveTab] = useState('guide');
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [riskFactors, setRiskFactors] = useState([]);
  const [historyData, setHistoryData] = useState([]);

  const [currentStep, setCurrentStep] = useState(1);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://127.0.0.1:8001/api/history', {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setHistoryData(data.map(item => ({
          date: new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          score: item.risk_score
        })));
      }
    } catch (error) {
      console.error("Erreur historique", error);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const [formData, setFormData] = useState({
    name: '', height: '', weight: '', age: '', sex: '1', smoker: '0',
    trestbps: '', chol: '', fbs: '0', cp: '0', exang: '0',
    thalch: '', restecg: '0', oldpeak: '0', slope: '1', ca: '0', thal: '2'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateBMI = () => {
    if (formData.height && formData.weight) {
      const h = parseFloat(formData.height) / 100;
      const w = parseFloat(formData.weight);
      return (w / (h * h)).toFixed(1);
    }
    return 'N/A';
  };

  const generateRiskFactors = (data) => {
    return [
      { name: 'Âge', impact: data.age > 55 ? 80 : (data.age > 40 ? 50 : 20) },
      { name: 'Tension', impact: data.trestbps > 140 ? 90 : (data.trestbps > 120 ? 60 : 30) },
      { name: 'Cholestérol', impact: data.chol > 240 ? 85 : (data.chol > 200 ? 55 : 25) },
      { name: 'Tabagisme', impact: data.smoker === '1' ? 95 : 5 },
      { name: 'Fréq. Cardiaque', impact: data.thalch < 100 ? 70 : 30 }
    ];
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { name, height, weight, smoker, ...dataForAI } = formData;
      const dataToSend = {};

      for (const key in dataForAI) {
        dataToSend[key] = parseFloat(dataForAI[key]);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8001/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (response.ok) {
        setResultData(data);
        setRiskFactors(generateRiskFactors(formData));
        fetchHistory();
        setCurrentStep(1);
        setActiveTab('results');
      } else {
        alert("Erreur du serveur : Vérifiez vos données.");
      }
    } catch (error) {
      alert("Erreur de connexion avec l'API.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    const input = document.getElementById('pdf-content');
    input.style.backgroundColor = 'white';
    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Dossier_CardioPredict_${formData.name || 'Patient'}.pdf`);
      input.style.backgroundColor = '';
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
          <button onClick={() => setActiveTab('guide')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'guide' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}><BookOpen size={20} /> Guide d'utilisation</button>
          <button onClick={() => setActiveTab('new_test')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'new_test' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}><Activity size={20} /> Nouvelle Analyse</button>
          <button onClick={() => setActiveTab('results')} disabled={!resultData} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'results' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'} disabled:opacity-50 disabled:cursor-not-allowed`}><FileText size={20} /> Rapport Actuel</button>
          <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'history' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}><Clock size={20} /> Mon Historique</button>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500"><User size={16} /></div>
          <div className="flex-1"><p className="text-sm font-semibold truncate">{userName}</p></div>
          <LogOut size={18} className="text-slate-400 hover:text-red-500 cursor-pointer transition-colors" onClick={handleLogout} title="Se déconnecter" />
        </div>
      </aside>

      {/* --- CONTENU PRINCIPAL --- */}
      <main className="flex-1 p-8 overflow-y-auto w-full">

        {/* ONGLET 1 : LE GUIDE (TOTALEMENT RÉVISÉ POUR L'ÉTAPE 4) */}
        {activeTab === 'guide' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">

            <div className="bg-teal-600 text-white rounded-2xl p-10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3"></div>
              <h1 className="text-3xl font-bold mb-4 relative z-10">Lexique & Explications Médicales</h1>
              <p className="text-teal-100 text-lg relative z-10">Comprenez facilement chaque paramètre clinique demandé dans le formulaire.</p>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl">
              <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2"><AlertCircle size={20}/> Ne devinez jamais !</h3>
              <p className="text-amber-700 text-sm">Les informations demandées à l'Étape 4 doivent être lues directement sur la conclusion du compte-rendu imprimé de votre cardiologue (après un test d'effort ou un électrocardiogramme).</p>
            </div>

            <div className="space-y-6">

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><TestTube className="text-teal-600"/> Étape 2 : Le Bilan Sanguin</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800 block mb-1">Cholestérol (mg/dl)</span>
                    <p className="text-sm text-slate-600">Sur votre feuille de prise de sang. Si votre résultat est en g/L, multipliez-le par 100 pour l'avoir en mg/dl (Ex: 2 g/L = 200 mg/dl).</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800 block mb-1">Glycémie à jeun</span>
                    <p className="text-sm text-slate-600">Votre taux de sucre dans le sang à jeun. Au-dessus de 120 mg/dl, cochez "Oui".</p>
                  </div>
                </div>
              </div>

              {/* L'EXPLICATION DÉTAILLÉE DE L'ÉTAPE 4 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><FileHeart className="text-teal-600"/> Étape 4 : Examens Cardiaques (ECG & Effort)</h2>

                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="bg-slate-100 text-slate-600 font-bold p-3 rounded-lg min-w-[140px] text-center text-sm">Fréq. Max (bpm)</div>
                    <p className="text-sm text-slate-700 mt-1">Lisez la ligne "FCM" (Fréquence Cardiaque Maximale) sur votre test d'effort. C'est le rythme le plus rapide atteint par votre cœur avant l'épuisement.</p>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="bg-slate-100 text-slate-600 font-bold p-3 rounded-lg min-w-[140px] text-center text-sm">ECG au repos</div>
                    <div className="text-sm text-slate-700 mt-1">
                      <p className="mb-2">Le tracé électrique de votre cœur au calme. Que dit la conclusion du médecin ?</p>
                      <ul className="list-disc pl-5 space-y-1 text-slate-600">
                        <li><strong>Normal :</strong> Le tracé est parfait, tout va bien.</li>
                        <li><strong>Anomalie de l'onde ST-T :</strong> L'électricité saute un peu, souvent parce que le cœur manque légèrement d'oxygène.</li>
                        <li><strong>Hypertrophie ventriculaire gauche :</strong> Le muscle gauche du cœur est gonflé/épaissi (souvent à cause d'une forte tension artérielle).</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="bg-slate-100 text-slate-600 font-bold p-3 rounded-lg min-w-[140px] text-center text-sm">Dépression ST<br/><span className="text-xs font-normal">(Oldpeak)</span></div>
                    <p className="text-sm text-slate-700 mt-1">Pendant un effort intense, la courbe de votre rythme cardiaque (l'ECG) peut "s'affaisser" et creuser sous sa ligne normale. Cette valeur mesure la profondeur de ce creux en millimètres. Plus le chiffre est grand (ex: 2 ou 3), plus le cœur souffre à l'effort.</p>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="bg-slate-100 text-slate-600 font-bold p-3 rounded-lg min-w-[140px] text-center text-sm">Pente du segment ST</div>
                    <div className="text-sm text-slate-700 mt-1">
                      <p className="mb-2">Après avoir fait ce "creux" pendant l'effort, comment la courbe remonte-t-elle ?</p>
                      <ul className="list-disc pl-5 space-y-1 text-slate-600">
                        <li><strong>Ascendante :</strong> La courbe remonte vers le haut. C'est très bon signe, le cœur récupère sainement.</li>
                        <li><strong>Plate :</strong> La courbe reste plate au fond du creux. C'est mauvais, souvent lié à une artère bouchée.</li>
                        <li><strong>Descendante :</strong> La courbe plonge vers le bas. C'est un signal d'alarme cardiaque sévère.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="bg-slate-100 text-slate-600 font-bold p-3 rounded-lg min-w-[140px] text-center text-sm">Vaisseaux Colorés</div>
                    <p className="text-sm text-slate-700 mt-1">Résultat d'une coronarographie (un colorant est injecté dans le sang). Le chiffre indique le nombre d'artères coronaires majeures (entre 0 et 3) qui sont bien irriguées et visibles.</p>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="bg-slate-100 text-slate-600 font-bold p-3 rounded-lg min-w-[140px] text-center text-sm">Test Thallium</div>
                    <div className="text-sm text-slate-700 mt-1">
                      <p className="mb-2">Test d'imagerie pour voir si le sang circule bien dans le muscle du cœur :</p>
                      <ul className="list-disc pl-5 space-y-1 text-slate-600">
                        <li><strong>Normal :</strong> L'irrigation est parfaite.</li>
                        <li><strong>Défaut réversible :</strong> Une partie du cœur manque de sang <em>seulement pendant l'effort</em>.</li>
                        <li><strong>Défaut fixe :</strong> Une zone du cœur ne reçoit jamais de sang (souvent la séquelle d'un ancien infarctus).</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-8 text-center">
              <button onClick={() => setActiveTab('new_test')} className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-10 rounded-xl shadow-lg transition">
                J'ai compris, commencer l'analyse
              </button>
            </div>

          </div>
        )}

        {/* ONGLET 2 : LE FORMULAIRE WIZARD (Par étapes) */}
        {activeTab === 'new_test' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-4xl mx-auto animate-fade-in-up">

            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Dossier Médical</h2>
                  <p className="text-slate-500">Étape {currentStep} sur 4</p>
                </div>
                <button type="button" onClick={() => setActiveTab('guide')} className="text-teal-600 hover:text-teal-700 text-sm font-semibold flex items-center gap-1">
                   Où trouver ces données ?
                </button>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2.5 mt-4">
                <div className="bg-teal-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(currentStep / 4) * 100}%` }}></div>
              </div>
            </div>

            <form onSubmit={handleAnalyze} className="space-y-6">

              {/* ÉTAPE 1 : Profil Patient */}
              {currentStep === 1 && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 animate-fade-in-up">
                  <h3 className="text-lg font-semibold text-slate-700 mb-6 flex items-center gap-2"><User size={20}/> 1. Profil du Patient</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Nom du patient (Optionnel)</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: Jean Dupont" className="w-full p-3 rounded-xl border border-slate-200 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Sexe</label>
                      <select name="sex" value={formData.sex} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 outline-none">
                        <option value="1">Homme</option>
                        <option value="0">Femme</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Âge (Années)</label>
                      <input type="number" name="age" value={formData.age} onChange={handleChange} required min="1" max="120" className="w-full p-3 rounded-xl border border-slate-200 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Taille (cm)</label>
                      <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="Ex: 175" className="w-full p-3 rounded-xl border border-slate-200 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Poids (kg)</label>
                      <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="Ex: 70" className="w-full p-3 rounded-xl border border-slate-200 outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 2 : Constantes de Base */}
              {currentStep === 2 && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 animate-fade-in-up">
                  <h3 className="text-lg font-semibold text-slate-700 mb-6 flex items-center gap-2"><TestTube size={20}/> 2. Constantes et Bilan Sanguin</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Tension artérielle au repos</label>
                      <p className="text-xs text-slate-400 mb-2">Mesurée en mmHg (Ex: Normale ~120)</p>
                      <input type="number" name="trestbps" value={formData.trestbps} onChange={handleChange} required placeholder="120" className="w-full p-3 rounded-xl border border-slate-200 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Cholestérol sérique</label>
                      <p className="text-xs text-slate-400 mb-2">Mesuré en mg/dl (Ex: Élevé > 240)</p>
                      <input type="number" name="chol" value={formData.chol} onChange={handleChange} required placeholder="200" className="w-full p-3 rounded-xl border border-slate-200 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Glycémie à jeun supérieure à 120 mg/dl ?</label>
                      <p className="text-xs text-slate-400 mb-2">Indicateur de diabète potentiel</p>
                      <select name="fbs" value={formData.fbs} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 outline-none">
                        <option value="0">Non</option>
                        <option value="1">Oui</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Patient Fumeur ?</label>
                      <p className="text-xs text-slate-400 mb-2">Facteur de risque cardiovasculaire majeur</p>
                      <select name="smoker" value={formData.smoker} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 outline-none">
                        <option value="0">Non</option>
                        <option value="1">Oui</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 : Symptômes */}
              {currentStep === 3 && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 animate-fade-in-up">
                  <h3 className="text-lg font-semibold text-slate-700 mb-6 flex items-center gap-2"><Activity size={20}/> 3. Évaluation des Symptômes</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Type de Douleur Thoracique ressentie</label>
                      <p className="text-xs text-slate-400 mb-2">Classification de l'angine de poitrine</p>
                      <select name="cp" value={formData.cp} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 outline-none">
                        <option value="0">Aucune / Asymptomatique (Pas de douleur)</option>
                        <option value="1">Angine typique (Douleur classique lors de l'effort)</option>
                        <option value="2">Angine atypique (Douleur non liée à l'effort)</option>
                        <option value="3">Douleur non angineuse (Spasmes, autre origine)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">L'effort physique déclenche-t-il une angine ?</label>
                      <p className="text-xs text-slate-400 mb-2">Douleur apparaissant spécifiquement pendant une activité</p>
                      <select name="exang" value={formData.exang} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 outline-none">
                        <option value="0">Non</option>
                        <option value="1">Oui</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 4 : Examens Médicaux Avancés */}
              {currentStep === 4 && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 animate-fade-in-up">
                  <h3 className="text-lg font-semibold text-slate-700 mb-6 flex items-center gap-2"><Stethoscope size={20}/> 4. Résultats Cliniques (ECG & Imagerie)</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Fréq. Cardiaque Max atteinte</label>
                      <p className="text-xs text-slate-400 mb-2">Lue sur le rapport du test d'effort (bpm)</p>
                      <input type="number" name="thalch" value={formData.thalch} onChange={handleChange} required placeholder="150" className="w-full p-3 rounded-xl border border-slate-200 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Résultat de l'ECG au repos</label>
                      <p className="text-xs text-slate-400 mb-2">Conclusion de l'électrocardiogramme</p>
                      <select name="restecg" value={formData.restecg} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 outline-none">
                        <option value="0">Normal</option>
                        <option value="1">Anomalie de l'onde ST-T</option>
                        <option value="2">Hypertrophie ventriculaire gauche</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Dépression ST (Oldpeak)</label>
                      <p className="text-xs text-slate-400 mb-2">Affaissement de la courbe (en mm)</p>
                      <input type="number" step="0.1" name="oldpeak" value={formData.oldpeak} onChange={handleChange} required placeholder="1.5" className="w-full p-3 rounded-xl border border-slate-200 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Pente du segment ST</label>
                      <p className="text-xs text-slate-400 mb-2">Sens de remontée de l'onde</p>
                      <select name="slope" value={formData.slope} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 outline-none">
                        <option value="0">Ascendante (Normal/Bon)</option>
                        <option value="1">Plate (Mauvais)</option>
                        <option value="2">Descendante (Critique)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Vaisseaux colorés</label>
                      <p className="text-xs text-slate-400 mb-2">Artères visibles à la radiographie</p>
                      <select name="ca" value={formData.ca} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 outline-none">
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                      </select>
                    </div>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Test d'effort au Thallium (Thal)</label>
                      <p className="text-xs text-slate-400 mb-2">Imagerie de l'irrigation sanguine du muscle cardiaque</p>
                      <select name="thal" value={formData.thal} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 outline-none">
                        <option value="1">Normal (Irrigation parfaite)</option>
                        <option value="2">Défaut fixe (Séquelle d'ancien infarctus)</option>
                        <option value="3">Défaut réversible (Manque de sang à l'effort)</option>
                      </select>
                  </div>
                </div>
              )}

              {/* BOUTONS DE NAVIGATION DU WIZARD */}
              <div className="flex justify-between pt-4 border-t border-slate-200">
                {currentStep > 1 ? (
                  <button type="button" onClick={() => setCurrentStep(currentStep - 1)} className="px-6 py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition flex items-center gap-2">
                    <ChevronLeft size={20} /> Retour
                  </button>
                ) : <div></div>}

                {currentStep < 4 ? (
                  <button type="button" onClick={() => setCurrentStep(currentStep + 1)} className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition shadow-lg">
                    Suivant <ChevronRight size={20} />
                  </button>
                ) : (
                  <button type="submit" disabled={isLoading} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition disabled:opacity-70 shadow-lg shadow-teal-600/30">
                    {isLoading ? 'Calcul IA en cours...' : 'Générer le Diagnostic'} <CheckCircle size={20} />
                  </button>
                )}
              </div>

            </form>
          </div>
        )}

        {/* ONGLET 3 : RÉSULTATS & PDF ENRICHIS */}
        {activeTab === 'results' && resultData && (
          <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
            <div className="flex justify-end gap-3 mb-2">
               <button onClick={downloadPDF} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-medium transition shadow-lg">
                  <Download size={18} /> Exporter le Dossier Médical
                </button>
            </div>

            <div id="pdf-content" className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-800">Dossier Médical & Rapport IA</h2>
                  <p className="text-slate-500 mt-1">Patient : {formData.name || 'Non renseigné'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">Date : {new Date().toLocaleDateString('fr-FR')}</p>
                  <p className="text-sm text-slate-500">ID : #{Math.floor(Math.random() * 9000) + 1000}</p>
                </div>
              </div>

              {/* Score IA */}
              <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center mb-8 border border-slate-100">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Probabilité de Risque Cardiaque</p>
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

              {/* Constantes Physiques */}
              <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Constantes Biométriques</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
                <div className="bg-white p-3 rounded-lg border border-slate-200"><span className="block text-slate-500 mb-1">Âge</span><span className="font-bold text-slate-800">{formData.age} ans</span></div>
                <div className="bg-white p-3 rounded-lg border border-slate-200"><span className="block text-slate-500 mb-1">Taille</span><span className="font-bold text-slate-800">{formData.height ? `${formData.height} cm` : 'N/A'}</span></div>
                <div className="bg-white p-3 rounded-lg border border-slate-200"><span className="block text-slate-500 mb-1">Poids</span><span className="font-bold text-slate-800">{formData.weight ? `${formData.weight} kg` : 'N/A'}</span></div>
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-800 text-white"><span className="block text-slate-300 mb-1">IMC (Calculé)</span><span className="font-bold text-xl">{calculateBMI()}</span></div>
              </div>

              {/* Variables IA */}
              <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Données Cliniques (Modèle ML)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-sm">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="block text-slate-500 mb-1">Tension</span><span className="font-bold text-slate-800">{formData.trestbps} mmHg</span></div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="block text-slate-500 mb-1">Cholestérol</span><span className="font-bold text-slate-800">{formData.chol} mg/dl</span></div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="block text-slate-500 mb-1">Fumeur</span><span className="font-bold text-slate-800">{formData.smoker === '1' ? 'Oui' : 'Non'}</span></div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="block text-slate-500 mb-1">Glycémie > 120</span><span className="font-bold text-slate-800">{formData.fbs === '1' ? 'Oui' : 'Non'}</span></div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2"><span className="block text-slate-500 mb-1">Douleur Thoracique</span><span className="font-bold text-slate-800">{formData.cp === '0' ? 'Aucune' : formData.cp === '1' ? 'Angine typique' : formData.cp === '2' ? 'Angine atypique' : 'Non angineuse'}</span></div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="block text-slate-500 mb-1">Angine Effort</span><span className="font-bold text-slate-800">{formData.exang === '1' ? 'Oui' : 'Non'}</span></div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="block text-slate-500 mb-1">Fréq. Max</span><span className="font-bold text-slate-800">{formData.thalch} bpm</span></div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="block text-slate-500 mb-1">Oldpeak</span><span className="font-bold text-slate-800">{formData.oldpeak} mm</span></div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="block text-slate-500 mb-1">Pente ST</span><span className="font-bold text-slate-800">{formData.slope === '0' ? 'Ascendante' : formData.slope === '1' ? 'Plate' : 'Descendante'}</span></div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="block text-slate-500 mb-1">Vaisseaux (CA)</span><span className="font-bold text-slate-800">{formData.ca}</span></div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="block text-slate-500 mb-1">Test Thal</span><span className="font-bold text-slate-800">{formData.thal === '1' ? 'Normal' : formData.thal === '2' ? 'Défaut Fixe' : 'Défaut Rév.'}</span></div>
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">Impact estimé des facteurs majeurs</h3>
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

        {/* ONGLET 4 : HISTORIQUE */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-4xl mx-auto animate-fade-in-up">
             <h2 className="text-2xl font-bold text-slate-900 mb-6">Historique des analyses</h2>
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