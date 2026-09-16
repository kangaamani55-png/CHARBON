const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Permet de recevoir les données JSON
app.use(express.json());

// Sert les fichiers du dossier public
app.use(express.static(path.join(__dirname, "public")));

// Route de test
app.get("/api/health", (req, res) => {
  res.json({
    message: "Serveur Vente Charbon fonctionne correctement"
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});