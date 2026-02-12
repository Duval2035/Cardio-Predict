<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prediction extends Model
{
    use HasFactory;

    // On autorise Laravel à remplir ces colonnes
    protected $fillable = [
        'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs',
        'restecg', 'thalch', 'exang', 'oldpeak', 'slope',
        'ca', 'thal', 'risk_score'
    ];
}
