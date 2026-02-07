import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
import joblib

# 1. Chargement des données
print("Chargement des données...")
df = pd.read_csv('../Data-analysis/heart_disease_uci.csv')

# 2. Nettoyage et Préparation
print("Nettoyage des données...")

# Suppression des colonnes inutiles (si elles existent)
cols_to_drop = ['id', 'dataset']
for col in cols_to_drop:
    if col in df.columns:
        print(f" - Suppression de la colonne inutile : {col}")
        df = df.drop(col, axis=1)

#Gestion des valeurs manquantes
df = df.replace('?', np.nan)
df = df.dropna()

# On parcourt toutes les colonnes. Si c'est du texte, on le transforme en chiffre.
le = LabelEncoder()

for col in df.columns:
    if df[col].dtype == 'object':  # Si c'est du texte
        print(f" - Encodage de la colonne texte '{col}' en nombres...")
        # sauvegarde le mapping pour info (ex: Female=0, Male=1)
        df[col] = le.fit_transform(df[col])

#  Correction de la colonne Cible (target/num) On s'assure qu'elle est binaire (0 ou 1)
target_col = 'num' if 'num' in df.columns else 'target'
if target_col in df.columns:
    # Si la valeur est > 0, c'est malade (1), sinon sain (0)
    df['target'] = df[target_col].apply(lambda x: 1 if x > 0 else 0)
    if target_col != 'target':
        df = df.drop(target_col, axis=1)

print(f"✅ Données prêtes ! Colonnes finales : {df.columns.tolist()}")

# Séparation des données
X = df.drop('target', axis=1)
y = df['target']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Entraînement
print("Entraînement du modèle...")
model = LogisticRegression(max_iter=3000)
model.fit(X_train, y_train)

# Évaluation
predictions = model.predict(X_test)
precision = accuracy_score(y_test, predictions)
print(f"✅ Modèle entraîné avec succès !")
print(f" Précision sur les tests : {precision:.2f} (soit {precision * 100:.0f}%)")

# 6. Sauvegarde
joblib.dump(model, 'cardio_model.pkl')
print(" Cerveau sauvegardé sous 'cardio_model.pkl'")

# On sauvegarde aussi les noms des colonnes pour l'API
joblib.dump(X.columns.tolist(), 'model_columns.pkl')
print(" Liste des colonnes sauvegardée sous 'model_columns.pkl'")

