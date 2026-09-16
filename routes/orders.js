const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const ordersFile = path.join(__dirname, "..", "data", "orders.json");
const usersFile = path.join(__dirname, "..", "data", "users.json");

const JWT_SECRET =
  process.env.JWT_SECRET || "blakflamme-secret-2026";

function getOrders() {
  try {
    return JSON.parse(fs.readFileSync(ordersFile, "utf8"));
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  fs.writeFileSync(
    ordersFile,
    JSON.stringify(orders, null, 2)
  );
}

function getUsers() {
  try {
    return JSON.parse(fs.readFileSync(usersFile, "utf8"));
  } catch {
    return [];
  }
}

// Vérifier la connexion
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Vous devez être connecté."
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message: "Session invalide ou expirée."
    });
  }
}

// Vérifier que l'utilisateur est administrateur
function requireAdmin(req, res, next) {
  const users = getUsers();

  const user = users.find(
    user => user.id === req.user.id
  );

  if (!user || user.role !== "admin") {
    return res.status(403).json({
      message: "Accès administrateur refusé."
    });
  }

  next();
}

// ===============================
// ENREGISTRER UNE COMMANDE
// ===============================

router.post("/", authenticate, (req, res) => {
  try {
    const {
      items,
      total,
      deliveryAddress
    } = req.body;

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "La commande est vide."
      });
    }

    const orders = getOrders();

    const order = {
      id: Date.now().toString(),

      userId: req.user.id,

      items,

      total: Number(total) || 0,

      deliveryAddress:
        deliveryAddress || "",

      status: "En attente",

      createdAt:
        new Date().toISOString()
    };

    orders.push(order);

    saveOrders(orders);

    res.status(201).json({
      message:
        "Commande enregistrée avec succès.",

      order
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Erreur lors de l'enregistrement de la commande."
    });
  }
});

// ===============================
// COMMANDES DU CLIENT
// ===============================

router.get(
  "/my-orders",
  authenticate,
  (req, res) => {

    const orders = getOrders();

    const userOrders =
      orders.filter(
        order =>
          order.userId === req.user.id
      );

    res.json({
      count: userOrders.length,

      orders: userOrders
    });
  }
);

// ===============================
// TOUTES LES COMMANDES
// ADMIN UNIQUEMENT
// ===============================

router.get(
  "/all",
  authenticate,
  requireAdmin,
  (req, res) => {

    const orders = getOrders();

    const users = getUsers();

    const ordersWithClient =
      orders.map(order => {

        const client =
          users.find(
            user =>
              user.id === order.userId
          );

        return {
          ...order,

          client: client
            ? {
                name: client.name,
                phone: client.phone,
                email: client.email
              }
            : null
        };
      });

    res.json({
      count: ordersWithClient.length,

      orders: ordersWithClient
    });
  }
);

// ===============================
// TERMINER UNE COMMANDE
// ADMIN UNIQUEMENT
// ===============================

router.patch(
  "/:id/complete",
  authenticate,
  requireAdmin,
  (req, res) => {

    const orders = getOrders();

    const order =
      orders.find(
        order =>
          order.id === req.params.id
      );

    if (!order) {
      return res.status(404).json({
        message:
          "Commande introuvable."
      });
    }

    order.status = "Terminée";

    order.completedAt =
      new Date().toISOString();

    saveOrders(orders);

    res.json({
      message:
        "Commande terminée avec succès.",

      order
    });
  }
);

module.exports = router;