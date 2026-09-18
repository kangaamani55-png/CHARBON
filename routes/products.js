const express = require("express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "public", "uploads"));
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const nom = "produit-" + Date.now() + extension;
    cb(null, nom);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});


const JWT_SECRET =
  process.env.JWT_SECRET || "blakflamme-secret-2026";

const usersFile = path.join(
  __dirname,
  "..",
  "data",
  "users.json"
);

function getUsers() {
  try {
    return JSON.parse(
      fs.readFileSync(usersFile, "utf8")
    );
  } catch (error) {
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

const productsFile = path.join(
  __dirname,
  "..",
  "data",
  "products.json"
);

function getProducts() {
  try {
    return JSON.parse(
      fs.readFileSync(productsFile, "utf8")
    );
  } catch (error) {
    return [];
  }
}

function saveProducts(products) {
  fs.writeFileSync(
    productsFile,
    JSON.stringify(products, null, 2),
    "utf8"
  );
}

// UPLOADER UNE PHOTO DE PRODUIT
router.post("/upload", authenticate, requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Aucune image re?ue."
    });
  }

  const imageUrl = "/uploads/" + req.file.filename;

  res.status(201).json({
    message: "Photo envoy?e avec succ?s.",
    image: imageUrl
  });
});

// AFFICHER TOUS LES PRODUITS
router.get("/", (req, res) => {
  res.json(getProducts());
});

// AJOUTER UN PRODUIT
router.post("/", authenticate, requireAdmin, (req, res) => {
  const { name, price, description, image } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({
      message: "Le nom et le prix sont obligatoires."
    });
  }

  const products = getProducts();

  const product = {
    id: Date.now().toString(),
    name: name.trim(),
    price: Number(price),
    description: description || "",
    image: image || ""
  };

  products.push(product);
  saveProducts(products);

  res.status(201).json({
    message: "Produit ajouté avec succès.",
    product
  });
});

// MODIFIER UN PRODUIT
router.put("/:id", authenticate, requireAdmin, (req, res) => {
  const products = getProducts();

  const index = products.findIndex(
    product => product.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: "Produit introuvable."
    });
  }

  const { name, price, description, image } = req.body;

  if (name !== undefined) {
    products[index].name = name.trim();
  }

  if (price !== undefined) {
    products[index].price = Number(price);
  }

  if (description !== undefined) {
    products[index].description = description;
  }

  if (image !== undefined) {
    products[index].image = image;
  }

  saveProducts(products);

  res.json({
    message: "Produit modifié avec succès.",
    product: products[index]
  });
});

// SUPPRIMER UN PRODUIT
router.delete("/:id", authenticate, requireAdmin, (req, res) => {  const products = getProducts();

  const filteredProducts = products.filter(
    product => product.id !== req.params.id
  );

  if (filteredProducts.length === products.length) {
    return res.status(404).json({
      message: "Produit introuvable."
    });
  }

  saveProducts(filteredProducts);

  res.json({
    message: "Produit supprimé avec succès."
  });
});

module.exports = router;
