<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Prediction;
use Illuminate\Support\Facades\Http;

class PredictionController extends Controller
{
    public function index()
    {
        // On ne prend QUE les prédictions de l'utilisateur actuellement connecté
        $history = Prediction::where('user_id', auth()->id())->orderBy('created_at', 'asc')->get();
        return response()->json($history);
    }

    public function store(Request $request)
    {
        //On valide UNIQUEMENT les données envoyées par le Frontend
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

        // On appelle l'IA (Python)
        try {
            // On envoie les données validées à Python
            $response = Http::post('http://127.0.0.1:8000/predict', $data);
            $aiResult = $response->json();

            if ($response->failed()) {
                return response()->json(['error' => 'Erreur de communication avec l\'IA'], 500);
            }

        } catch (\Exception $e) {
            return response()->json(['error' => 'Le serveur IA est éteint. Lance python main.py !'], 500);
        }

        // On prépare les données pour la base de données MySQL
        $dataToSave = $data;

        // C'EST ICI QU'ON AJOUTE L'UTILISATEUR ET LE SCORE IA :
        $dataToSave['user_id'] = auth()->id();
        // Note: Assure-toi que c'est le bon chemin pour récupérer ton score selon ton main.py
        $dataToSave['risk_score'] = $aiResult['data']['risk_score'] ?? $aiResult['risk_score'] ?? 0;

        //On sauvegarde TOUT dans la base de données MySQL
        $prediction = Prediction::create($dataToSave);

        // On renvoie le résultat au Frontend pour l'affichage
        return response()->json([
            'message' => 'Prédiction réussie',
            'data' => $prediction,
            'ai_message' => $aiResult['ai_message'] ?? $aiResult['message'] ?? 'Analyse terminée'
        ], 201);
    }
}
