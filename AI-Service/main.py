from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import uvicorn

# 1. Initialisation de l'API
app = FastAPI(
    title="Cardio-Predict API",
    description="API de prédiction de risque cardiaque",
    version="1.0"
)

# 2. Chargement du Cerveau (Le Modèle)
print("Chargement du modèle IA...")
try:
    model = joblib.load('cardio_model.pkl')
    model_columns = joblib.load('model_columns.pkl')  # Pour être sûr de l'ordre des colonnes
    print("✅ Modèle chargé avec succès !")
    print(f"ℹ️ Colonnes attendues par l'IA : {model_columns}")
except Exception as e:
    print(f"❌ Erreur lors du chargement du modèle : {e}")
    model = None
    model_columns = []


# 3. Définition du format des données attendues (Validation)
class PatientData(BaseModel):
    age: int
    sex: int  # 1 = Homme, 0 = Femme
    cp: int  # Douleur thoracique (0-3)
    trestbps: int  # Tension au repos (mm Hg)
    chol: int  # Cholestérol (mg/dl)
    fbs: int  # Sucre > 120mg (1=Oui, 0=Non)
    restecg: int  # ECG au repos (0, 1, 2)
    thalch: int  # CORRECTION ICI : thalch (comme dans le dataset) et pas thalach
    exang: int  # Angine sport (1=Oui, 0=Non)
    oldpeak: float  # Dépression ST (ex: 2.5)
    slope: int  # Pente (0-2)
    ca: float  # Nombre de vaisseaux (0-3)
    thal: int  # Thalassémie (0-3)


# Route pour la page d'accueil (évite le 404)
@app.get("/")
def read_root():
    return {"message": "L'API Cardio-Predict tourne ! Va sur /docs pour tester."}


# 4. La Route de Prédiction
@app.post("/predict")
def predict_risk(data: PatientData):
    if not model:
        raise HTTPException(status_code=500, detail="Modèle non chargé")

    # A. Transformation des données reçues en DataFrame
    # CORRECTION ICI : data.dict() -> data.model_dump()
    input_data = data.model_dump()
    df = pd.DataFrame([input_data])

    # B. On s'assure que les colonnes sont dans le bon ordre
    try:
        # On ne garde que les colonnes que le modèle connait
        df = df[model_columns]
    except KeyError as e:
        # Si une colonne manque ou est mal orthographiée, on renvoie l'erreur précise
        missing_cols = list(set(model_columns) - set(df.columns))
        raise HTTPException(status_code=400,
                            detail=f"Erreur de colonnes. Manquantes ou mal nommées : {missing_cols}. Erreur originale : {e}")

    # C. Prédiction
    try:
        prediction = model.predict(df)
        probability = model.predict_proba(df)

        # On récupère la probabilité d'être malade (la 2ème valeur, index 1)
        risk_percent = round(probability[0][1] * 100, 2)

        return {
            "prediction": int(prediction[0]),  # 0 ou 1
            "risk_score": risk_percent,  # Ex: 78.5%
            "message": "Risque élevé" if risk_percent > 50 else "Risque faible"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur interne lors de la prédiction : {e}")


# Lancement du serveur
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)