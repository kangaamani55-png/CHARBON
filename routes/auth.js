const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const usersFile = path.join(__dirname, "..", "data", "users.json");
const resetFile = path.join(__dirname, "..", "data", "password-resets.json");

const JWT_SECRET = process.env.JWT_SECRET || "blakflamme-secret-2026";

function getUsers() {
  try {
    return JSON.parse(fs.readFileSync(usersFile, "utf8"));
  } catch {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

function getResets() {
  try {
    return JSON.parse(fs.readFileSync(resetFile, "utf8"));
  } catch {
    return [];
  }
}

function saveResets(resets) {
  fs.writeFileSync(resetFile, JSON.stringify(resets, null, 2));
}

// INSCRIPTION
router.post("/register", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        message: "Tous les champs sont obligatoires."
      });
    }

    const users = getUsers();

    const existingUser = users.find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return res.status(409).json({
        message: "Un compte existe déjà avec cet email."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      name,
      phone,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "client",
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    res.status(201).json({
      message: "Compte créé avec succès."
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la création du compte."
    });
  }
});

// CONNEXION
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email et mot de passe obligatoires."
      });
    }

    const users = getUsers();

    const user = users.find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect."
      });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect."
      });
    }
const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role || "client"
  },      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      message: "Connexion réussie.",
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role || "client"
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la connexion."
    });
  }
});

// DEMANDE DE RÉINITIALISATION
router.post("/forgot-password", (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Veuillez entrer votre adresse e-mail."
      });
    }

    const users = getUsers();

    const user = users.find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );

    // Même réponse pour éviter de révéler si un compte existe
    if (!user) {
      return res.json({
        message: "Si un compte correspond à cette adresse, une procédure de réinitialisation sera lancée."
      });
    }

    const code = crypto.randomInt(100000, 1000000).toString();

    const resets = getResets();

    // Supprime les anciens codes pour cet utilisateur
    const filteredResets = resets.filter(
      reset => reset.userId !== user.id
    );

    filteredResets.push({
      userId: user.id,
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
      used: false
    });

    saveResets(filteredResets);

    console.log(`CODE DE RÉINITIALISATION POUR ${user.email}: ${code}`);

    res.json({
      message: "Un code de réinitialisation a été généré."
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la demande de réinitialisation."
    });
  }
});

// VÉRIFICATION DU CODE
router.post("/verify-reset-code", (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message: "E-mail et code obligatoires."
      });
    }

    const users = getUsers();

    const user = users.find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return res.status(400).json({
        message: "Code invalide ou expiré."
      });
    }

    const resets = getResets();

    const reset = resets.find(
      item =>
        item.userId === user.id &&
        item.code === code &&
        !item.used &&
        item.expiresAt > Date.now()
    );

    if (!reset) {
      return res.status(400).json({
        message: "Code invalide ou expiré."
      });
    }

    res.json({
      message: "Code valide."
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la vérification du code."
    });
  }
});

// NOUVEAU MOT DE PASSE
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        message: "Tous les champs sont obligatoires."
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Le nouveau mot de passe doit contenir au moins 6 caractères."
      });
    }

    const users = getUsers();

    const user = users.find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return res.status(400).json({
        message: "Code invalide ou expiré."
      });
    }

    const resets = getResets();

    const resetIndex = resets.findIndex(
      item =>
        item.userId === user.id &&
        item.code === code &&
        !item.used &&
        item.expiresAt > Date.now()
    );

    if (resetIndex === -1) {
      return res.status(400).json({
        message: "Code invalide ou expiré."
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    saveUsers(users);

    resets[resetIndex].used = true;
    saveResets(resets);

    res.json({
      message: "Mot de passe réinitialisé avec succès."
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la réinitialisation du mot de passe."
    });
  }
});

module.exports = router;