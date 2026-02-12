import urllib.request
import json

# L'URL de ton Backend Laravel (Port 8001)
url = "http://127.0.0.1:8001/api/predict"

# Les données d'un patient fictif (Format JSON)
data = {
    "age": 63,
    "sex": 1,
    "cp": 3,
    "trestbps": 145,
    "chol": 233,
    "fbs": 1,
    "restecg": 0,
    "thalch": 150,
    "exang": 0,
    "oldpeak": 2.3,
    "slope": 0,
    "ca": 0,
    "thal": 1
}

# Préparation de la requête
req = urllib.request.Request(url)
req.add_header('Content-Type', 'application/json; charset=utf-8')
jsondata = json.dumps(data)
jsondataasbytes = jsondata.encode('utf-8')  # Conversion en octets pour l'envoi
req.add_header('Content-Length', len(jsondataasbytes))

print("📡 Envoi des données au Backend Laravel...")

try:
    # Envoi de la requête
    response = urllib.request.urlopen(req, jsondataasbytes)

    # Lecture de la réponse
    data = json.load(response)

    print("\n✅ SUCCÈS ! Réponse reçue du serveur :")
    print("-" * 30)
    print(f"Risk Score IA : {data['data']['risk_score']}%")
    print(f"Message IA    : {data['ai_message']}")
    print("-" * 30)
    print("Détail complet :", data)

except urllib.error.URLError as e:
    print(f"\n❌ ERREUR DE CONNEXION : {e}")
    print("Vérifie que :")
    print("1. Ton serveur Laravel tourne sur le port 8001 (php artisan serve --port=8001)")
    print("2. Ton serveur Python tourne sur le port 8000 (python main.py)")