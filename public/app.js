const buttons = document.querySelectorAll("article button");

const panierListe = document.getElementById("panier-liste");
const panierTotal = document.getElementById("panier-total");
const viderPanier = document.getElementById("vider-panier");
const commander = document.getElementById("commander");

let panier = [];

// =========================
// PANIER
// =========================

function afficherPanier() {
    panierListe.innerHTML = "";

    if (panier.length === 0) {
        panierListe.innerHTML = "<p>Votre panier est vide.</p>";
        panierTotal.textContent = "0 FCFA";
        commander.disabled = true;
        return;
    }

    commander.disabled = false;

    let total = 0;

    panier.forEach((produit, index) => {
        const sousTotal = produit.prix * produit.quantite;
        total += sousTotal;

        const ligne = document.createElement("div");

        ligne.innerHTML = `
            <p><strong>${produit.nom}</strong></p>
            <p>${produit.prix.toLocaleString()} FCFA × ${produit.quantite}</p>

            <button onclick="diminuerQuantite(${index})">−</button>
            <button onclick="augmenterQuantite(${index})">+</button>
            <button onclick="supprimerProduit(${index})">❌</button>

            <p>
                Sous-total :
                <strong>${sousTotal.toLocaleString()} FCFA</strong>
            </p>

            <hr>
        `;

        panierListe.appendChild(ligne);
    });

    panierTotal.textContent =
        total.toLocaleString() + " FCFA";
}


// =========================
// AJOUTER AU PANIER
// =========================

buttons.forEach(function (button) {

    button.addEventListener("click", function () {

        const article = button.closest("article");

        const nom =
            article.querySelector("h3").textContent;

        const prixTexte =
            article.querySelector("p").textContent;

        const prix =
            parseInt(prixTexte.replace(/\D/g, ""));

        const produitExistant =
            panier.find(function (produit) {
                return produit.nom === nom;
            });

        if (produitExistant) {

            produitExistant.quantite++;

        } else {

            panier.push({
                nom: nom,
                prix: prix,
                quantite: 1
            });

        }

        afficherPanier();

    });

});


// =========================
// AUGMENTER
// =========================

function augmenterQuantite(index) {

    panier[index].quantite++;

    afficherPanier();
}


// =========================
// DIMINUER
// =========================

function diminuerQuantite(index) {

    panier[index].quantite--;

    if (panier[index].quantite <= 0) {

        panier.splice(index, 1);

    }

    afficherPanier();
}


// =========================
// SUPPRIMER
// =========================

function supprimerProduit(index) {

    panier.splice(index, 1);

    afficherPanier();
}


// =========================
// VIDER
// =========================

viderPanier.addEventListener("click", function () {

    panier = [];

    afficherPanier();

});


// =========================
// COMMANDER
// =========================

commander.addEventListener("click", function () {

    if (panier.length === 0) {
        return;
    }

    alert("Votre commande peut maintenant être préparée.");

});


// ==================================================
// CHATBOT
// ==================================================

const chatbotHTML = `
    <button id="chatbot-bouton">💬</button>

    <div id="chatbot">

        <div id="chatbot-header">
            <strong>🔥 Assistant BLAKFLAMME</strong>
            <button id="chatbot-fermer">×</button>
        </div>

        <div id="chatbot-messages">

            <div class="bot-message">
                Bonjour 👋 Bienvenue chez BLAKFLAMME !
                <br><br>
                Comment puis-je vous aider ?
            </div>

        </div>

        <div id="chatbot-choix">

            <button data-question="produits">
                🪵 Produits
            </button>

            <button data-question="commande">
                📦 Commander
            </button>

            <button data-question="paiement">
                💳 Paiement
            </button>

            <button data-question="contact">
                📞 Contact
            </button>

        </div>

        <div id="chatbot-input">

            <input
                type="text"
                id="chatbot-message"
                placeholder="Écrivez votre message..."
            >

            <button id="chatbot-envoyer">
                ➤
            </button>

        </div>

    </div>
`;

document.body.insertAdjacentHTML(
    "beforeend",
    chatbotHTML
);


// =========================
// ÉLÉMENTS CHATBOT
// =========================

const chatbotBouton =
    document.getElementById("chatbot-bouton");

const chatbot =
    document.getElementById("chatbot");

const chatbotFermer =
    document.getElementById("chatbot-fermer");

const chatbotMessages =
    document.getElementById("chatbot-messages");

const chatbotInput =
    document.getElementById("chatbot-message");

const chatbotEnvoyer =
    document.getElementById("chatbot-envoyer");


// =========================
// OUVRIR
// =========================

chatbotBouton.addEventListener("click", function () {

    chatbot.classList.add("ouvert");

});


// =========================
// FERMER
// =========================

chatbotFermer.addEventListener("click", function () {

    chatbot.classList.remove("ouvert");

});


// =========================
// MESSAGE
// =========================

function ajouterMessage(message, type) {

    const div = document.createElement("div");

    div.className =
        type === "user"
            ? "user-message"
            : "bot-message";

    div.textContent = message;

    chatbotMessages.appendChild(div);

    chatbotMessages.scrollTop =
        chatbotMessages.scrollHeight;
}


// =========================
// RÉPONSES
// =========================

function repondre(message) {

    const texte = message.toLowerCase();


    if (
        texte.includes("bonjour") ||
        texte.includes("salut") ||
        texte.includes("bonsoir")
    ) {

        return "Bonjour 👋 Bienvenue chez BLAKFLAMME ! Comment puis-je vous aider ?";

    }


    if (
        texte.includes("produit") ||
        texte.includes("charbon") ||
        texte.includes("prix") ||
        texte.includes("kg")
    ) {

        return "🪵 Nos produits sont : 5 kg à 1 500 FCFA, 10 kg à 2 500 FCFA, 25 kg à 5 000 FCFA et 50 kg à 9 000 FCFA.";

    }


    if (
        texte.includes("commande") ||
        texte.includes("commander") ||
        texte.includes("acheter")
    ) {

        return "📦 Pour commander, ajoutez votre produit au panier, puis cliquez sur « Passer la commande ».";

    }


    if (
        texte.includes("payer") ||
        texte.includes("paiement") ||
        texte.includes("wave") ||
        texte.includes("orange money") ||
        texte.includes("mtn") ||
        texte.includes("moov")
    ) {

        return "💳 Pour le paiement, les moyens disponibles seront indiqués lors de votre commande.";

    }


    if (
        texte.includes("livraison") ||
        texte.includes("livrer")
    ) {

        return "🚚 Indiquez votre adresse ou votre quartier lors de la commande afin que la livraison puisse être organisée.";

    }


    if (
        texte.includes("contact") ||
        texte.includes("whatsapp") ||
        texte.includes("email") ||
        texte.includes("e-mail")
    ) {

        return "📞 Vous pouvez nous contacter avec les boutons WhatsApp et E-mail dans la section Contact.";

    }


    if (texte.includes("merci")) {

        return "Avec plaisir 😊 BLAKFLAMME reste à votre service !";

    }


    return "😊 Je peux vous renseigner sur les produits, les prix, les commandes, le paiement, la livraison et le contact.";

}


// =========================
// ENVOYER
// =========================

function envoyerMessage() {

    const message =
        chatbotInput.value.trim();

    if (message === "") {
        return;
    }

    ajouterMessage(message, "user");

    chatbotInput.value = "";

    setTimeout(function () {

        ajouterMessage(
            repondre(message),
            "bot"
        );

    }, 500);

}


chatbotEnvoyer.addEventListener(
    "click",
    envoyerMessage
);


chatbotInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            envoyerMessage();

        }

    }
);


// =========================
// BOUTONS RAPIDES
// =========================

document
    .querySelectorAll("#chatbot-choix button")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const question =
                    button.dataset.question;

                let message = "";


                if (question === "produits") {

                    message =
                        "Quels sont vos produits et leurs prix ?";

                }


                if (question === "commande") {

                    message =
                        "Comment passer une commande ?";

                }


                if (question === "paiement") {

                    message =
                        "Comment payer ma commande ?";

                }


                if (question === "contact") {

                    message =
                        "Comment vous contacter ?";

                }


                ajouterMessage(
                    message,
                    "user"
                );


                setTimeout(function () {

                    ajouterMessage(
                        repondre(message),
                        "bot"
                    );

                }, 500);

            }
        );

    });


// =========================
// DÉMARRAGE
// =========================

afficherPanier();