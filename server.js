const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Sert les fichiers du site
app.use(express.static(path.join(__dirname, "public")));

// Routes d'authentification
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Routes des commandes
const orderRoutes = require("./routes/orders");
app.use("/api/orders", orderRoutes);

// Route de test
app.get("/api/health", (req, res) => {
  res.json({
    message: "Serveur BLAKFLAMME fonctionne correctement"
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur BLAKFLAMME démarré sur le port ${PORT}`);
});