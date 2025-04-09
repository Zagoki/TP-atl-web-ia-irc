const net = require("net");

const PORT = 5001;

// Connexion au serveur
const client = net.createConnection(PORT, "localhost", () => {
  console.log("--- Connecté au serveur.");

  // Creer une requete JSON de type "echo"
  const request = {
    request: "echo",
    params: {
      text: "texte a envoyer, j'ai pas d'inspi", // Texte a envoyer
    },
  };

  // Envoie la requete JSON au serveur
  client.write(JSON.stringify(request));
});

// gere la reponse du serveur
client.on("data", (data) => {
  try {
    const response = JSON.parse(data.toString().trim()); // Parse la réponse JSON
    console.log("Réponse du serv :", response);
  } catch (err) {
    console.error("Erreur lors du traitement de la réponse :", err.message);
  } finally {
    client.end(); // Fermer la connexion
  }
});

client.on("end", () => {
  console.log("--- Déconnecté du serveur.");
});
