import "dotenv/config";
import { connectToDatabase } from "../config/database";

// Corrige les logs créés AVANT l'ajout des champs success/latencyMs (Phase 1
// de l'enrichissement dashboard). Ces vieux logs représentaient de vraies
// requêtes réussies à l'époque (sinon elles n'auraient pas de "cost" > 0),
// donc on les marque success: true plutôt que de les compter comme des
// échecs. On leur donne aussi une latence estimée réaliste par provider,
// faute de la vraie valeur (perdue, car jamais enregistrée à l'époque).

const ESTIMATED_LATENCY_MS: Record<string, number> = {
  groq: 700,
  ollama: 400,
  openai: 1800,
};

async function migrate() {
  const db = await connectToDatabase();
  const collection = db.collection("usageLogs");

  const legacyFilter = { success: { $exists: false } };
  const legacyCount = await collection.countDocuments(legacyFilter);

  if (legacyCount === 0) {
    console.log("Aucun log legacy à migrer. Rien à faire.");
    process.exit(0);
  }

  console.log(`${legacyCount} log(s) legacy trouvé(s). Migration en cours...`);

  // On met à jour provider par provider pour appliquer une latence estimée différente à chacun.
  for (const [provider, latencyMs] of Object.entries(ESTIMATED_LATENCY_MS)) {
    const result = await collection.updateMany(
      { ...legacyFilter, provider },
      { $set: { success: true, latencyMs } }
    );
    console.log(`  - ${provider}: ${result.modifiedCount} log(s) mis à jour`);
  }

  // Filet de sécurité pour un provider qui ne serait pas dans la liste ci-dessus.
  const fallbackResult = await collection.updateMany(legacyFilter, {
    $set: { success: true, latencyMs: 500 },
  });
  if (fallbackResult.modifiedCount > 0) {
    console.log(`  - autres providers: ${fallbackResult.modifiedCount} log(s) mis à jour (latence par défaut)`);
  }

  console.log("Migration terminée.");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Échec de la migration:", err);
  process.exit(1);
});