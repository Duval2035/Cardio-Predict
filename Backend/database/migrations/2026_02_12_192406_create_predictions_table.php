<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('predictions', function (Blueprint $table) {
        $table->id();
        // Infos Patient
        $table->integer('age');
        $table->integer('sex');       // 1=Homme, 0=Femme
        $table->integer('cp');        // Douleur thoracique
        $table->integer('trestbps');  // Tension
        $table->integer('chol');      // Cholestérol
        $table->integer('fbs');       // Sucre
        $table->integer('restecg');   // ECG
        $table->integer('thalch');    // Fréquence cardiaque max
        $table->integer('exang');     // Angine sport
        $table->float('oldpeak');     // Dépression ST
        $table->integer('slope');     // Pente
        $table->float('ca');          // Vaisseaux
        $table->integer('thal');      // Thalassémie

        // Résultat IA
        $table->float('risk_score');  // Le % de risque (ex: 75.50)

        $table->timestamps(); // Date de création automatique
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('predictions');
    }
};
