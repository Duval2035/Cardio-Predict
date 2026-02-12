<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Prediction;
use Illuminate\Support\Facades\Http; // Pour parler à Python

class PredictionController extends Controller
{
    public function store(Request $request)
    {
        // 1. On récupère les données envoyées par le Frontend
        $data = $request->validate([
            'age' => 'required|numeric',
            'sex' => 'required|numeric',
            'cp' => 'required|numeric',
            'trestbps' => 'required|numeric',
            'chol' => 'required|numeric',
            'fbs' => 'required|numeric',
            'restecg' => 'required|numeric',
            'thalch' => 'required|numeric',
            'exang' => 'required|numeric',
            'oldpeak' => 'required|numeric',
            'slope' => 'required|numeric',
            'ca' => 'required|numeric',
            'thal' => 'required|numeric',
        ]);

        // 2. On appelle l'IA (Python)
        // Assure-toi que ton script Python (main.py) tourne sur le port 8000 !
        try {
            $response = Http::post('http://127.0.0.1:8000/predict', $data);
            $aiResult = $response->json(); // On récupère la réponse JSON de Python

            // Si l'IA renvoie une erreur, on arrête tout
            if ($response->failed()) {
                return response()->json(['error' => 'Erreur de communication avec l\'IA'], 500);
            }

        } catch (\Exception $e) {
            return response()->json(['error' => 'Le serveur IA est éteint. Lance python main.py !'], 500);
        }

        // 3. On ajoute le score de l'IA aux données à sauvegarder
        $data['risk_score'] = $aiResult['risk_score'];

        // 4. On sauvegarde TOUT dans la base de données MySQL
        $prediction = Prediction::create($data);

        // 5. On renvoie le résultat au Frontend pour l'affichage
        return response()->json([
            'message' => 'Prédiction réussie',
            'data' => $prediction,
            'ai_message' => $aiResult['message'] // "Risque élevé" ou "faible"
        ], 201);
    }
}
